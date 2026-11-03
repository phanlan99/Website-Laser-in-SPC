import type { ReactNode } from "react";
import Link from "next/link";
import AufnrRecordsTable from "@/components/statistics/AufnrRecordsTable";
import { CARD, StatCard } from "@/components/statistics/StatisticsContent";
import { getAufnrDetail, resolveFilters, type AufnrDetail, type HistorySearchParams } from "@/lib/history";
import { detailHref, filtersToQuery, formatDateTime } from "@/lib/statistics-url";

export type DetailSearchParams = HistorySearchParams & { scope?: string };

type Props = {
  params: Promise<{ aufnr: string }>;
  searchParams: Promise<DetailSearchParams>;
};

const nf = new Intl.NumberFormat("vi-VN");
const viDate = (ymd: string) => ymd.split("-").reverse().join("/");

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Trang chi tiết 1 AUFNR: thông tin mã + 4 thẻ số liệu + lịch sử từng lần khắc */
export async function AufnrDetailView({ params, searchParams }: Props) {
  const aufnr = safeDecode((await params).aufnr).trim();
  const sp = await searchParams;
  const f = resolveFilters(sp);
  const all = sp.scope === "all";
  const query = filtersToQuery(f);
  const backHref = `/statistics${query ? `?${query}` : ""}`;
  const rangeLabel = all ? "Toàn bộ thời gian" : `${viDate(f.from)} – ${viDate(f.to)}`;

  let detail: AufnrDetail | null = null;
  let failed = false;
  try {
    detail = await getAufnrDetail(aufnr, all ? null : f);
  } catch (e) {
    console.error("[statistics/aufnr] Lỗi truy vấn:", e);
    failed = true;
  }

  const scopeBtn = (active: boolean) =>
    `whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-white text-[#1d3f8f] shadow-sm" : "text-[#5b6785] hover:text-[#0f1a2e]"
    }`;

  const header = (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Quay lại trang thống kê"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d9e0ec] bg-white text-[#3d4a66] shadow-sm transition hover:border-[#2f5bea] hover:text-[#2f5bea]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#8a94ad]">
            <Link href={backHref} className="hover:text-[#1d3f8f]">
              Thống kê
            </Link>{" "}
            / Chi tiết AUFNR
          </p>
          <h1 className="truncate font-mono text-xl font-bold text-[#0f1a2e]">{aufnr}</h1>
        </div>
      </div>

      <div className="flex self-start rounded-lg bg-white/80 p-1 shadow-sm ring-1 ring-[#e3e8f2] sm:self-auto" aria-label="Phạm vi thời gian">
        <Link href={detailHref(aufnr, query)} aria-current={!all ? "page" : undefined} className={scopeBtn(!all)}>
          {viDate(f.from)} – {viDate(f.to)}
        </Link>
        <Link href={detailHref(aufnr, query, true)} aria-current={all ? "page" : undefined} className={scopeBtn(all)}>
          Toàn bộ thời gian
        </Link>
      </div>
    </header>
  );

  if (failed) {
    return (
      <>
        {header}
        <div className="rounded-2xl border border-[#f3c7c7] bg-[#fff5f5]/90 px-5 py-4 text-sm text-[#b42318]">
          Không kết nối được database. Kiểm tra cấu hình trong .env.local và mạng tới máy chủ MySQL.
        </div>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        {header}
        <div className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}>
          <p className="text-sm font-semibold text-[#0f1a2e]">
            Không có lần khắc nào của <span className="font-mono">{aufnr}</span> ({rangeLabel.toLowerCase()})
          </p>
          <div className="mt-4 flex gap-2">
            {!all && (
              <Link href={detailHref(aufnr, query, true)} className="rounded-lg bg-[#1d3f8f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f5bea]">
                Xem toàn bộ thời gian
              </Link>
            )}
            <Link href={backHref} className="rounded-lg border border-[#d9e0ec] bg-white px-4 py-2 text-sm font-semibold text-[#3d4a66] hover:text-[#0f1a2e]">
              Quay lại thống kê
            </Link>
          </div>
        </div>
      </>
    );
  }

  const s = detail.summary;
  const ratio = s.GAMNG > 0 ? (s.soluongkhacthucte / s.GAMNG) * 100 : 0;
  const done = s.GAMNG > 0 && s.soluongkhacthucte >= s.GAMNG;

  const info: { label: string; field: string; value: ReactNode }[] = [
    { label: "Mã hàng", field: "mahang", value: s.mahang || "—" },
    {
      label: "Loại hàng",
      field: "product_type",
      value: s.product_type ? (
        <span className="inline-flex rounded-md bg-[#f7efdf] px-2 py-0.5 text-xs font-semibold text-[#86662c]">{s.product_type}</span>
      ) : (
        "—"
      ),
    },
    {
      label: "Mã viết tắt",
      field: "product_mahang",
      value: <span className="font-mono text-[#1d3f8f]">{s.product_mahang || "—"}</span>,
    },
    { label: "Cập nhật mới nhất", field: "time_new_update", value: <span className="tabular-nums">{formatDateTime(s.time_new_update)}</span> },
  ];

  return (
    <>
      {header}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.9fr)_repeat(4,minmax(0,1fr))]" aria-label="Tổng quan mã">
        {/* Thông tin mã */}
        <div className={`${CARD} col-span-2 p-4 sm:p-5 xl:col-span-1`}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#5b6785]">Thông tin mã</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                done ? "bg-[#e6f6ec] text-[#117a43]" : "bg-[#eaf0ff] text-[#1d3f8f]"
              }`}
            >
              {done ? "Đã khắc đủ" : "Đang khắc"}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {info.map((it) => (
              <div key={it.field} className="min-w-0">
                <dt className="text-[11px] text-[#8a94ad]">
                  {it.label} <span className="font-mono text-[10px] text-[#b8a073]">{it.field}</span>
                </dt>
                <dd className="mt-0.5 break-words text-sm font-semibold text-[#0f1a2e]">{it.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <StatCard label="Số lượng" value={nf.format(s.GAMNG)} hint="GAMNG của mã" icon="box" tone="brass" />
        <StatCard
          label="Đã khắc"
          value={nf.format(s.soluongkhacthucte)}
          hint={`Còn lại ${nf.format(Math.max(0, s.GAMNG - s.soluongkhacthucte))}`}
          icon="laser"
          tone="green"
        />
        <StatCard label="Khắc lỗi" value={nf.format(s.errors)} hint={`Trên ${nf.format(s.records)} lần ghi nhận`} icon="alert" tone="red" />
        <StatCard label="Tỉ lệ hoàn thành" value={`${ratio.toFixed(1)}%`} hint="Đã khắc / Số lượng" icon="gauge" tone="violet">
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ecebf7]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#6a55d8] to-[#2f5bea]" style={{ width: `${Math.min(100, ratio)}%` }} />
          </div>
        </StatCard>
      </section>

      <section className="flex min-h-[420px] flex-col lg:min-h-0 lg:flex-1" aria-label="Lịch sử khắc">
        <AufnrRecordsTable key={`${aufnr}_${all}_${query}`} records={detail.records} gamng={s.GAMNG} rangeLabel={rangeLabel} />
      </section>
    </>
  );
}

export function DetailSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-9 w-9 animate-pulse rounded-xl bg-white/80" />
        <div className="h-6 w-56 animate-pulse rounded bg-white/80" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.9fr)_repeat(4,minmax(0,1fr))]" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${CARD} h-[118px] animate-pulse ${i === 0 ? "col-span-2 xl:col-span-1" : ""}`} />
        ))}
      </div>
      <div className={`${CARD} min-h-[420px] animate-pulse lg:min-h-0 lg:flex-1`} aria-busy="true" aria-label="Đang tải dữ liệu" />
    </>
  );
}