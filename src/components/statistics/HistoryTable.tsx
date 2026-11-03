"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Pagination, { paginate } from "@/components/statistics/Pagination";
import type { HistorySummary } from "@/lib/history";
import { detailHref, formatDateTime } from "@/lib/statistics-url";

const nf = new Intl.NumberFormat("vi-VN");

const COLUMNS = [
  { label: "Mã hàng", field: "AUFNR", align: "left" },
  { label: "Mã hàng", field: "mahang", align: "left" },
  { label: "Loại hàng", field: "product_type", align: "left" },
  { label: "Mã viết tắt", field: "product_mahang", align: "left" },
  { label: "Số lượng", field: "GAMNG", align: "right" },
  { label: "Đã khắc", field: "soluongkhacthucte", align: "right" },
  { label: "Cập nhật mới nhất", field: "time_new_update", align: "left" },
] as const;

/** Một bộ lọc đang áp dụng – bấm để gỡ */
export type FilterChip = { label: string; value: string; href: string };

type Props = {
  rows: HistorySummary[];
  /** vd "01/11/2026 – 03/11/2026" */
  rangeLabel: string;
  chips: FilterChip[];
  clearHref: string;
  /** Query string bộ lọc hiện tại – gắn vào link chi tiết để quay lại đúng chỗ */
  detailQuery: string;
  /** true nếu số mã chạm giới hạn truy vấn */
  truncated?: boolean;
};

/**
 * Bảng chi tiết có phân trang phía trình duyệt.
 * Bấm vào 1 hàng → trang chi tiết của AUFNR đó.
 */
export default function HistoryTable({ rows, rangeLabel, chips, clearHref, detailQuery, truncated = false }: Props) {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { current, start, slice } = paginate(rows, page, pageSize);

  const toTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e3e8f2] bg-white/85 shadow-[0_1px_2px_rgba(16,24,40,.04),0_12px_32px_-16px_rgba(16,24,40,.18)] backdrop-blur-md">
      {/* Thanh tiêu đề + bộ lọc đang áp dụng */}
      <div className="flex flex-col gap-2.5 border-b border-[#edf1f7] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0f1a2e]">Chi tiết theo mã AUFNR</h2>
          <p className="mt-0.5 text-xs text-[#8a94ad]">
            {rangeLabel} · {nf.format(rows.length)} mã · Bấm vào một hàng để xem chi tiết
            {truncated && <span className="ml-1 text-[#b45309]">(đã chạm giới hạn, hãy thu hẹp bộ lọc)</span>}
          </p>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                title="Bỏ bộ lọc này"
                className="group inline-flex items-center gap-1.5 rounded-full border border-[#d6e0ff] bg-[#eef3ff] py-1 pl-2.5 pr-1.5 text-xs text-[#1d3f8f] transition hover:border-[#2f5bea]/40"
              >
                <span className="text-[#5b6785]">{c.label}:</span>
                <span className="max-w-40 truncate font-semibold">{c.value}</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[#5b6785] group-hover:bg-[#2f5bea] group-hover:text-white" aria-hidden>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </span>
              </Link>
            ))}
            {chips.length > 1 && (
              <Link href={clearHref} className="px-1.5 text-xs font-semibold text-[#5b6785] hover:text-[#b42318]">
                Xóa tất cả
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Vùng bảng – tự cuộn bên trong, tiêu đề cột dính trên cùng */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 py-14 text-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b8c1d6" strokeWidth="1.4" aria-hidden>
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <p className="mt-3 text-sm font-semibold text-[#0f1a2e]">Không có dữ liệu phù hợp</p>
            <p className="mt-1 text-xs text-[#8a94ad]">Thử mở rộng khoảng ngày hoặc bỏ bớt bộ lọc.</p>
          </div>
        ) : (
          <table className="w-full min-w-[1040px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f6f8fc]/95 backdrop-blur">
                <th className="w-14 border-b border-[#e3e8f2] px-4 py-3 text-left text-xs font-semibold text-[#8a94ad] sm:px-5">#</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.field}
                    className={`whitespace-nowrap border-b border-[#e3e8f2] px-4 py-2.5 ${c.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <span className="block text-[13px] font-semibold text-[#1d2b4a]">{c.label}</span>
                    <span className="block font-mono text-[10.5px] font-normal text-[#9a7838]">{c.field}</span>
                  </th>
                ))}
                <th className="w-10 border-b border-[#e3e8f2]" aria-label="Xem chi tiết" />
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => {
                const done = r.GAMNG > 0 && r.soluongkhacthucte >= r.GAMNG;
                const pct = r.GAMNG > 0 ? Math.min(100, (r.soluongkhacthucte / r.GAMNG) * 100) : 0;
                const href = detailHref(r.AUFNR, detailQuery);
                return (
                  <tr
                    key={r.AUFNR}
                    onClick={() => router.push(href)}
                    className="group cursor-pointer border-b border-[#f0f3f8] transition-colors odd:bg-white even:bg-[#fafbfe] hover:bg-[#eef3ff]"
                  >
                    <td className="px-4 py-3 tabular-nums text-[#a3acc2] sm:px-5">{start + i + 1}</td>
                    <td className="px-4 py-3">
                      {/* Link thật để dùng được bàn phím / mở tab mới */}
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-[#0f1a2e] underline-offset-4 outline-none group-hover:text-[#1d3f8f] group-hover:underline focus-visible:underline"
                      >
                        {r.AUFNR}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#3d4a66]">{r.mahang || "—"}</td>
                    <td className="px-4 py-3">
                      {r.product_type ? (
                        <span className="inline-flex rounded-md bg-[#f7efdf] px-2 py-0.5 text-xs font-semibold text-[#86662c]">{r.product_type}</span>
                      ) : (
                        <span className="text-[#a3acc2]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.product_mahang ? (
                        <span className="font-mono text-[13px] font-medium text-[#1d3f8f]">{r.product_mahang}</span>
                      ) : (
                        <span className="text-[#a3acc2]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#3d4a66]">{nf.format(r.GAMNG)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {r.GAMNG > 0 && (
                          <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[#e8ecf4] md:block">
                            <span className={`block h-full rounded-full ${done ? "bg-[#16a35a]" : "bg-[#2f5bea]"}`} style={{ width: `${pct}%` }} />
                          </span>
                        )}
                        <span className={`min-w-10 text-right font-semibold tabular-nums ${done ? "text-[#16a35a]" : "text-[#1d3f8f]"}`}>
                          {nf.format(r.soluongkhacthucte)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#5b6785]">{formatDateTime(r.time_new_update)}</td>
                    <td className="pr-4 text-[#b8c1d6] transition group-hover:translate-x-0.5 group-hover:text-[#2f5bea]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        total={rows.length}
        page={current}
        pageSize={pageSize}
        unit="mã"
        onPage={(p) => {
          setPage(p);
          toTop();
        }}
        onPageSize={(n) => {
          setPageSize(n);
          setPage(1);
          toTop();
        }}
      />
    </div>
  );
}