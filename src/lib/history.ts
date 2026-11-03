import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

/** Một dòng thống kê theo mã AUFNR */
export type HistorySummary = {
  AUFNR: string;
  mahang: string;
  /** Loại hàng */
  product_type: string;
  /** Mã viết tắt */
  product_mahang: string;
  GAMNG: number;
  /** Tổng soluongkhac (1 = khắc xong, 0 = hủy do E-Stop) */
  soluongkhacthucte: number;
  /** Thời gian ghi gần nhất của AUFNR, dạng "YYYY-MM-DD HH:mm:ss" */
  time_new_update: string;
};

/** Khoảng ngày dạng "YYYY-MM-DD", tính cả 2 đầu */
export type DateRange = { from: string; to: string };

/** Toàn bộ bộ lọc của trang thống kê */
export type HistoryFilters = DateRange & {
  aufnr: string;
  mahang: string;
  /** Lọc đúng giá trị Loại hàng */
  productType: string;
  /** Lọc gần đúng Mã viết tắt */
  productMahang: string;
};

/** Tham số trên URL: ?from=&to=&aufnr=&mahang=&ptype=&pcode= */
export type HistorySearchParams = {
  from?: string;
  to?: string;
  aufnr?: string;
  mahang?: string;
  ptype?: string;
  pcode?: string;
};

export type FilterOptions = {
  productTypes: string[];
  productMahangs: string[];
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toYMD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isValidYMD(s?: string): s is string {
  if (!s || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function nextDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return toYMD(new Date(y, m - 1, d + 1));
}

/** Làm sạch chuỗi lọc từ URL (bỏ khoảng trắng, giới hạn độ dài) */
function clean(v?: string): string {
  return (v ?? "").trim().slice(0, 100);
}

/** Thoát ký tự đặc biệt của LIKE để người dùng gõ % hoặc _ không bị hiểu sai */
function likeContains(v: string): string {
  return `%${v.replace(/[\\%_]/g, "\\$&")}%`;
}

/** Đọc khoảng ngày từ URL; sai định dạng hoặc thiếu thì mặc định 7 ngày gần nhất */
export function resolveDateRange(input: { from?: string; to?: string }): DateRange {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  let from = isValidYMD(input.from) ? input.from : toYMD(weekAgo);
  let to = isValidYMD(input.to) ? input.to : toYMD(today);
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

/** Đọc toàn bộ bộ lọc từ URL */
export function resolveFilters(input: HistorySearchParams): HistoryFilters {
  return {
    ...resolveDateRange(input),
    aufnr: clean(input.aufnr),
    mahang: clean(input.mahang),
    productType: clean(input.ptype),
    productMahang: clean(input.pcode),
  };
}

/** Điều kiện WHERE dùng chung (chỉ có khoảng thời gian) */
function rangeWhere(range: DateRange): { sql: string; params: string[] } {
  return {
    sql: "time_record >= ? AND time_record < ?",
    params: [`${range.from} 00:00:00`, `${nextDay(range.to)} 00:00:00`],
  };
}

interface SummaryRow extends RowDataPacket {
  AUFNR: string;
  mahang: string | null;
  product_type: string | null;
  product_mahang: string | null;
  GAMNG: string | null;
  soluongkhacthucte: string | number | null;
  time_new_update: string;
}

/**
 * Gom các dòng HistoryLaser cùng AUFNR theo bộ lọc:
 * - mahang, product_type, product_mahang, GAMNG giống nhau trong cùng AUFNR nên lấy MAX
 * - soluongkhacthucte = SUM(soluongkhac)   (vd: 1 + 1 + 0 + 1 = 3)
 * - time_new_update   = MAX(time_record)
 */
export async function getHistorySummary(f: HistoryFilters, limit = 1000): Promise<HistorySummary[]> {
  const base = rangeWhere(f);
  const where = ["AUFNR IS NOT NULL", "AUFNR <> ''", base.sql];
  const params: (string | number)[] = [...base.params];

  if (f.aufnr) {
    where.push("AUFNR LIKE ?");
    params.push(likeContains(f.aufnr));
  }
  if (f.mahang) {
    where.push("mahang LIKE ?");
    params.push(likeContains(f.mahang));
  }
  if (f.productType) {
    where.push("product_type = ?");
    params.push(f.productType);
  }
  if (f.productMahang) {
    where.push("product_mahang LIKE ?");
    params.push(likeContains(f.productMahang));
  }

  const sql = `
    SELECT
      AUFNR,
      MAX(mahang)                   AS mahang,
      MAX(product_type)             AS product_type,
      MAX(product_mahang)           AS product_mahang,
      MAX(GAMNG)                    AS GAMNG,
      COALESCE(SUM(soluongkhac), 0) AS soluongkhacthucte,
      MAX(time_record)              AS time_new_update
    FROM HistoryLaser
    WHERE ${where.join(" AND ")}
    GROUP BY AUFNR
    ORDER BY time_new_update DESC
    LIMIT ?`;
  params.push(limit);

  const [rows] = await db.query<SummaryRow[]>(sql, params);

  return rows.map((r) => ({
    AUFNR: r.AUFNR,
    mahang: r.mahang ?? "",
    product_type: r.product_type ?? "",
    product_mahang: r.product_mahang ?? "",
    GAMNG: Number(r.GAMNG) || 0,
    soluongkhacthucte: Number(r.soluongkhacthucte) || 0,
    time_new_update: r.time_new_update,
  }));
}

interface ValueRow extends RowDataPacket {
  v: string;
}

/** Danh sách Loại hàng / Mã viết tắt có trong khoảng thời gian – để gợi ý trong bộ lọc */
export async function getFilterOptions(range: DateRange): Promise<FilterOptions> {
  const base = rangeWhere(range);
  const distinct = (col: "product_type" | "product_mahang") =>
    db.query<ValueRow[]>(
      `SELECT DISTINCT ${col} AS v FROM HistoryLaser
       WHERE ${base.sql} AND ${col} IS NOT NULL AND ${col} <> ''
       ORDER BY v LIMIT 300`,
      base.params,
    );

  const [[types], [codes]] = await Promise.all([distinct("product_type"), distinct("product_mahang")]);
  return {
    productTypes: types.map((r) => r.v),
    productMahangs: codes.map((r) => r.v),
  };
}

/* ------------------------------------------------------------------ */
/*  Chi tiết 1 mã AUFNR                                                */
/* ------------------------------------------------------------------ */

/** Một lần khắc (1 dòng HistoryLaser) */
export type HistoryRecord = {
  id: number;
  time_record: string;
  /** 1 = khắc thành công, 0 = lỗi / hủy do E-Stop */
  soluongkhac: number;
  /** Mã nhân viên */
  Code: string;
  /** Tên nhân viên */
  Name: string;
};

export type AufnrDetail = {
  summary: HistorySummary & {
    /** Số lần khắc lỗi (soluongkhac = 0) */
    errors: number;
    /** Tổng số bản ghi */
    records: number;
  };
  /** Mới nhất ở trên */
  records: HistoryRecord[];
};

interface DetailRow extends RowDataPacket {
  id: number;
  time_record: string;
  soluongkhac: number | string | null;
  Code: string | null;
  Name: string | null;
  mahang: string | null;
  product_type: string | null;
  product_mahang: string | null;
  GAMNG: string | null;
}

/**
 * Lấy toàn bộ lần khắc của 1 AUFNR.
 * range = null → lấy toàn bộ thời gian.
 * Trả về null nếu không có bản ghi nào.
 */
export async function getAufnrDetail(aufnr: string, range: DateRange | null, limit = 10000): Promise<AufnrDetail | null> {
  const where = ["AUFNR = ?"];
  const params: (string | number)[] = [aufnr];
  if (range) {
    const r = rangeWhere(range);
    where.push(r.sql);
    params.push(...r.params);
  }
  params.push(limit);

  const [rows] = await db.query<DetailRow[]>(
    `SELECT id, time_record, soluongkhac, Code, Name, mahang, product_type, product_mahang, GAMNG
     FROM HistoryLaser
     WHERE ${where.join(" AND ")}
     ORDER BY time_record DESC, id DESC
     LIMIT ?`,
    params,
  );
  if (rows.length === 0) return null;

  const first = (k: "mahang" | "product_type" | "product_mahang" | "GAMNG") =>
    rows.find((r) => r[k] != null && r[k] !== "")?.[k] ?? "";

  const records: HistoryRecord[] = rows.map((r) => ({
    id: r.id,
    time_record: r.time_record,
    soluongkhac: Number(r.soluongkhac) || 0,
    Code: r.Code ?? "",
    Name: r.Name ?? "",
  }));
  const done = records.reduce((s, r) => s + r.soluongkhac, 0);

  return {
    summary: {
      AUFNR: aufnr,
      mahang: String(first("mahang")),
      product_type: String(first("product_type")),
      product_mahang: String(first("product_mahang")),
      GAMNG: Number(first("GAMNG")) || 0,
      soluongkhacthucte: done,
      time_new_update: records[0].time_record,
      errors: records.filter((r) => r.soluongkhac === 0).length,
      records: records.length,
    },
    records,
  };
}