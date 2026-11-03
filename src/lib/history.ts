import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";

/** Một dòng thống kê theo mã AUFNR */
export type HistorySummary = {
  AUFNR: string;
  mahang: string;
  GAMNG: number;
  /** Tổng soluongkhac (1 = khắc xong, 0 = hủy do E-Stop) */
  soluongkhacthucte: number;
  /** Thời gian ghi gần nhất của AUFNR, dạng "YYYY-MM-DD HH:mm:ss" */
  time_new_update: string;
};

/** Khoảng ngày dạng "YYYY-MM-DD", tính cả 2 đầu */
export type DateRange = { from: string; to: string };

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

interface SummaryRow extends RowDataPacket {
  AUFNR: string;
  mahang: string | null;
  GAMNG: string | null;
  soluongkhacthucte: string | number | null;
  time_new_update: string;
}

/**
 * Gom các dòng HistoryLaser cùng AUFNR trong khoảng thời gian:
 * - mahang, GAMNG giống nhau trong cùng AUFNR nên lấy MAX
 * - soluongkhacthucte = SUM(soluongkhac)   (vd: 1 + 1 + 0 + 1 = 3)
 * - time_new_update   = MAX(time_record)
 */
export async function getHistorySummary(range: DateRange, limit = 1000): Promise<HistorySummary[]> {
  const sql = `
    SELECT
      AUFNR,
      MAX(mahang)                   AS mahang,
      MAX(GAMNG)                    AS GAMNG,
      COALESCE(SUM(soluongkhac), 0) AS soluongkhacthucte,
      MAX(time_record)              AS time_new_update
    FROM HistoryLaser
    WHERE AUFNR IS NOT NULL AND AUFNR <> ''
      AND time_record >= ? AND time_record < ?
    GROUP BY AUFNR
    ORDER BY time_new_update DESC
    LIMIT ?`;

  const [rows] = await db.query<SummaryRow[]>(sql, [
    `${range.from} 00:00:00`,
    `${nextDay(range.to)} 00:00:00`,
    limit,
  ]);

  return rows.map((r) => ({
    AUFNR: r.AUFNR,
    mahang: r.mahang ?? "",
    GAMNG: Number(r.GAMNG) || 0,
    soluongkhacthucte: Number(r.soluongkhacthucte) || 0,
    time_new_update: r.time_new_update,
  }));
}