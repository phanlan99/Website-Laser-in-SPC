import type { ReactNode } from "react";
import HistoryFilters from "@/components/statistics/HistoryFilters";
import StatisticsCharts, { type StatisticsChartsProps } from "@/components/statistics/StatisticsCharts";
import { PALETTE } from "@/components/charts/chart-kit";
import HistoryTable, { type FilterChip } from "@/components/statistics/HistoryTable";
import {
  getFilterOptions,
  getHistorySummary,
  getStatisticsCharts,
  resolveFilters,
  type FilterOptions,
  type HistoryFilters as Filters,
  type HistorySearchParams,
  type HistorySummary,
  type StatisticsChartData,
} from "@/lib/history";
import { detailHref, filtersToQuery } from "@/lib/statistics-url";
import { machineName, machineOptions } from "@/lib/machines";

type SP = { searchParams: Promise<HistorySearchParams> };

/** Số mã AUFNR tối đa lấy về mỗi lần lọc (thẻ số liệu tính trên toàn bộ số này) */
const MAX_ROWS = 5000;

/** Link trang thống kê theo bộ lọc, có thể bỏ bớt vài khóa (để tạo link gỡ lọc) */
function toQuery(f: Filters, omit: (keyof Filters)[] = []): string {
  return `/statistics?${filtersToQuery(f, omit)}`;
}

const nf = new Intl.NumberFormat("vi-VN");
const viDate = (ymd: string) => ymd.split("-").reverse().join("/");
export const CARD =
  "rounded-2xl border border-[#e3e8f2] bg-white/80 shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-12px_rgba(16,24,40,.14)] backdrop-blur-md";

/* ------------------------------------------------------------------ */
/*  Bộ lọc – chỉ cần đọc URL nên hiện ra ngay                          */
/* ------------------------------------------------------------------ */
export async function StatisticsFilter({ searchParams }: SP) {
  const f = resolveFilters(await searchParams);

  let options: FilterOptions = { productTypes: [], productMahangs: [], machines: [] };
  try {
    options = await getFilterOptions(f);
  } catch (e) {
    // Không lấy được gợi ý thì bộ lọc vẫn dùng được bình thường
    console.error("[statistics] Lỗi lấy danh sách gợi ý:", e);
  }

  return (
    <HistoryFilters
      key={toQuery(f)}
      initial={{
        from: f.from,
        to: f.to,
        aufnr: f.aufnr,
        mahang: f.mahang,
        productType: f.productType,
        productMahang: f.productMahang,
        errorFilter: f.errorFilter,
        machine: f.machine,
      }}
      productTypes={options.productTypes}
      productMahangs={options.productMahangs}
      machines={machineOptions(options.machines)}
    />
  );
}

export function FilterSkeleton() {
  return <div className={`${CARD} h-[150px] w-full animate-pulse min-[1900px]:h-[74px]`} aria-hidden />;
}

/* ------------------------------------------------------------------ */
/*  Thẻ số liệu                                                        */
/* ------------------------------------------------------------------ */
const icons = {
  code: (
    <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 8v8M11 8v8M14 8v8M17 8v8" />
  ),
  box: <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />,
  laser: <path d="M12 2v6M12 16v6M2 12h6M16 12h6M12 12h.01M8.5 8.5 12 12l3.5-3.5" />,
  gauge: <path d="M12 14l4-4M3.5 18a9 9 0 1 1 17 0" />,
  alert: <path d="M12 3 2.5 20h19L12 3ZM12 10v4M12 17.2v.1" />,
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  icon: keyof typeof icons;
  tone: "blue" | "brass" | "green" | "violet" | "red";
  children?: ReactNode;
}) {
  const toneCls = {
    blue: "bg-[#eaf0ff] text-[#2f5bea]",
    brass: "bg-[#f7efdf] text-[#9a7838]",
    green: "bg-[#e6f6ec] text-[#16a35a]",
    violet: "bg-[#efecff] text-[#6a55d8]",
    red: "bg-[#fdecec] text-[#d92d20]",
  }[tone];
  return (
    <div className={`${CARD} relative overflow-hidden p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#5b6785]">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-bold tabular-nums text-[#0f1a2e] sm:text-[28px]">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneCls}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {icons[icon]}
          </svg>
        </span>
      </div>
      {children}
      <p className="mt-2 text-xs text-[#8a94ad]">{hint}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Số liệu + bảng – đọc URL và truy vấn database                      */
/* ------------------------------------------------------------------ */
export async function StatisticsData({ searchParams }: SP) {
  const f = resolveFilters(await searchParams);

  let rows: HistorySummary[] = [];
  let chart: StatisticsChartData;
  try {
    [rows, chart] = await Promise.all([getHistorySummary(f, MAX_ROWS), getStatisticsCharts(f)]);
  } catch (e) {
    console.error("[statistics] Lỗi truy vấn HistoryLaser:", e);
    return (
      <div className="rounded-2xl border border-[#f3c7c7] bg-[#fff5f5]/90 px-5 py-4 text-sm text-[#b42318] backdrop-blur-md">
        Không kết nối được database. Kiểm tra cấu hình trong .env.local và mạng tới máy chủ MySQL.
      </div>
    );
  }

  const totalQty = rows.reduce((s, r) => s + r.GAMNG, 0);
  const totalDone = rows.reduce((s, r) => s + r.soluongkhacthucte, 0);
  const completed = rows.filter((r) => r.GAMNG > 0 && r.soluongkhacthucte >= r.GAMNG).length;
  const ratio = totalQty > 0 ? (totalDone / totalQty) * 100 : 0;
  const rangeLabel = `${viDate(f.from)} – ${viDate(f.to)}`;

  // Các bộ lọc đang áp dụng (hiển thị dạng chip, bấm để gỡ)
  const chipDefs: [keyof Filters, string][] = [
    ["aufnr", "AUFNR"],
    ["mahang", "Mã hàng"],
    ["productType", "Loại hàng"],
    ["productMahang", "Mã viết tắt"],
    ["machine", "Mã máy"],
    ["errorFilter", "Khắc lỗi"],
  ];
  const chipValue = (k: keyof Filters) =>
    k === "errorFilter"
      ? f.errorFilter === "yes"
        ? "Có lỗi"
        : "Không lỗi"
      : k === "machine"
        ? machineName(Number(f.machine))
        : f[k];
  const chips: FilterChip[] = chipDefs
    .filter(([k]) => f[k])
    .map(([k, label]) => ({ label, value: chipValue(k), href: toQuery(f, [k]) }));
  const clearHref = toQuery(f, ["aufnr", "mahang", "productType", "productMahang", "errorFilter", "machine"]);
  const withErrors = rows.filter((r) => r.errors > 0).length;
  const charts = buildCharts(rows, chart, filtersToQuery(f));

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label={chips.length ? "Tổng quan theo bộ lọc" : "Tổng quan"}>
        <StatCard label="Số mã AUFNR" value={nf.format(rows.length)} hint={`${nf.format(completed)} mã đã khắc đủ · ${nf.format(withErrors)} mã có lỗi`} icon="code" tone="blue" />
        <StatCard label="Tổng số lượng" value={nf.format(totalQty)} hint="Tổng GAMNG của các mã" icon="box" tone="brass" />
        <StatCard
          label="Tổng đã khắc"
          value={nf.format(totalDone)}
          hint={`Còn lại ${nf.format(Math.max(0, totalQty - totalDone))}`}
          icon="laser"
          tone="green"
        />
        <StatCard label="Tỉ lệ hoàn thành" value={`${ratio.toFixed(1)}%`} hint="Đã khắc / Số lượng" icon="gauge" tone="violet">
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ecebf7]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#6a55d8] to-[#2f5bea]" style={{ width: `${Math.min(100, ratio)}%` }} />
          </div>
        </StatCard>
      </section>

      <section aria-label="Biểu đồ phân tích">
        <StatisticsCharts {...charts} />
      </section>

      <section className="flex flex-col" aria-label="Bảng thống kê">
        <HistoryTable
          key={toQuery(f)}
          rows={rows}
          rangeLabel={rangeLabel}
          chips={chips}
          clearHref={clearHref}
          detailQuery={filtersToQuery(f)}
          truncated={rows.length >= MAX_ROWS}
        />
      </section>
    </>
  );
}

export function DataSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${CARD} h-[118px] animate-pulse`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`${CARD} h-[330px] animate-pulse ${i === 0 ? "lg:col-span-2" : ""} ${i === 5 ? "lg:col-span-2 xl:col-span-3" : ""}`} />
        ))}
      </div>
      <div className={`${CARD} h-[520px] animate-pulse`} aria-busy="true" aria-label="Đang tải dữ liệu" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Gom dữ liệu biểu đồ ở server – chỉ gửi số liệu gọn xuống trình duyệt */
/* ------------------------------------------------------------------ */
function buildCharts(rows: HistorySummary[], chart: StatisticsChartData, query: string): StatisticsChartsProps {
  // Tình trạng mã
  const status = { done: 0, progress: 0, idle: 0 };
  for (const r of rows) {
    if (r.GAMNG > 0 && r.soluongkhacthucte >= r.GAMNG) status.done++;
    else if (r.soluongkhacthucte > 0) status.progress++;
    else status.idle++;
  }

  // Tỉ trọng Loại hàng theo số đã khắc (top 6, còn lại gộp "Khác")
  const byType = new Map<string, number>();
  for (const r of rows) {
    const k = r.product_type || "Chưa phân loại";
    byType.set(k, (byType.get(k) ?? 0) + r.soluongkhacthucte);
  }
  const typeSorted = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const typeTop = typeSorted.slice(0, 6);
  const typeRest = typeSorted.slice(6).reduce((s, [, v]) => s + v, 0);
  const productTypes = [
    ...typeTop.map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] })),
    ...(typeRest > 0 ? [{ label: "Khác", value: typeRest, color: "#94a3b8" }] : []),
  ];

  // Top Mã viết tắt theo số đã khắc
  const byCode = new Map<string, { done: number; qty: number; n: number }>();
  for (const r of rows) {
    if (!r.product_mahang) continue;
    const v = byCode.get(r.product_mahang) ?? { done: 0, qty: 0, n: 0 };
    v.done += r.soluongkhacthucte;
    v.qty += r.GAMNG;
    v.n++;
    byCode.set(r.product_mahang, v);
  }
  const topCodes = [...byCode.entries()]
    .sort((a, b) => b[1].done - a[1].done)
    .slice(0, 7)
    .map(([label, v]) => ({ label, sub: `${v.n} mã`, value: v.done, target: v.qty }));

  // Top AUFNR nhiều lỗi
  const topErrors = rows
    .filter((r) => r.errors > 0)
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 7)
    .map((r) => ({ label: r.AUFNR, sub: r.product_mahang || r.mahang, value: r.errors, href: `${detailHref(r.AUFNR, query)}${query ? "&" : "?"}tab=error` }));

  return { ...chart, status, productTypes, topCodes, topErrors };
}