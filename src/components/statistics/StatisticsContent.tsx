import type { ReactNode } from "react";
import DateRangeFilter from "@/components/statistics/DateRangeFilter";
import HistoryTable from "@/components/statistics/HistoryTable";
import { getHistorySummary, resolveDateRange, type HistorySummary } from "@/lib/history";

type SP = { searchParams: Promise<{ from?: string; to?: string }> };

const nf = new Intl.NumberFormat("vi-VN");
const viDate = (ymd: string) => ymd.split("-").reverse().join("/");
const CARD =
  "rounded-2xl border border-[#e3e8f2] bg-white/80 shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-12px_rgba(16,24,40,.14)] backdrop-blur-md";

/* ------------------------------------------------------------------ */
/*  Bộ lọc – chỉ cần đọc URL nên hiện ra ngay                          */
/* ------------------------------------------------------------------ */
export async function StatisticsFilter({ searchParams }: SP) {
  const range = resolveDateRange(await searchParams);
  return <DateRangeFilter key={`${range.from}_${range.to}`} from={range.from} to={range.to} />;
}

export function FilterSkeleton() {
  return <div className={`${CARD} h-[66px] w-full animate-pulse md:w-[640px]`} aria-hidden />;
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
};

function StatCard({
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
  tone: "blue" | "brass" | "green" | "violet";
  children?: ReactNode;
}) {
  const toneCls = {
    blue: "bg-[#eaf0ff] text-[#2f5bea]",
    brass: "bg-[#f7efdf] text-[#9a7838]",
    green: "bg-[#e6f6ec] text-[#16a35a]",
    violet: "bg-[#efecff] text-[#6a55d8]",
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
  const range = resolveDateRange(await searchParams);

  let rows: HistorySummary[] = [];
  try {
    rows = await getHistorySummary(range);
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
  const rangeLabel = `${viDate(range.from)} – ${viDate(range.to)}`;

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Tổng quan">
        <StatCard label="Số mã AUFNR" value={nf.format(rows.length)} hint={`${nf.format(completed)} mã đã khắc đủ`} icon="code" tone="blue" />
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

      <section className="flex min-h-[440px] flex-col lg:min-h-0 lg:flex-1" aria-label="Bảng thống kê">
        <HistoryTable rows={rows} rangeLabel={rangeLabel} />
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
      <div className={`${CARD} min-h-[440px] animate-pulse lg:min-h-0 lg:flex-1`} aria-busy="true" aria-label="Đang tải dữ liệu" />
    </>
  );
}