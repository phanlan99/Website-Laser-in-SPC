"use client";

import { useDeferredValue, useState } from "react";
import type { HistorySummary } from "@/lib/history";

/** "2026-11-03 14:05:09" -> "03/11/2026 14:05:09" (không đổi múi giờ) */
function formatDateTime(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}` : s;
}

const nf = new Intl.NumberFormat("vi-VN");

const COLUMNS = [
  { label: "Mã hàng", field: "AUFNR", align: "left" },
  { label: "Mã hàng", field: "mahang", align: "left" },
  { label: "Số lượng", field: "GAMNG", align: "right" },
  { label: "Đã khắc", field: "soluongkhacthucte", align: "right" },
  { label: "Cập nhật mới nhất", field: "time_new_update", align: "left" },
] as const;

type Props = {
  rows: HistorySummary[];
  /** Chuỗi hiển thị khoảng ngày, vd "01/11/2026 – 03/11/2026" */
  rangeLabel: string;
};

export default function HistoryTable({ rows, rangeLabel }: Props) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const shown = q
    ? rows.filter((r) => r.AUFNR.toLowerCase().includes(q) || r.mahang.toLowerCase().includes(q))
    : rows;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e3e8f2] bg-white/85 shadow-[0_1px_2px_rgba(16,24,40,.04),0_12px_32px_-16px_rgba(16,24,40,.18)] backdrop-blur-md">
      {/* Thanh công cụ của bảng */}
      <div className="flex flex-col gap-3 border-b border-[#edf1f7] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0f1a2e]">Chi tiết theo mã AUFNR</h2>
          <p className="mt-0.5 text-xs text-[#8a94ad]">
            {rangeLabel} · {nf.format(shown.length)}
            {q ? ` / ${nf.format(rows.length)}` : ""} mã
          </p>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Lọc theo mã</span>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a94ad]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lọc theo AUFNR hoặc mã hàng…"
            className="h-9 w-full rounded-lg border border-[#d9e0ec] bg-[#f8f9fd] pl-9 pr-3 text-sm text-[#0f1a2e] outline-none transition placeholder:text-[#a3acc2] focus:border-[#2f5bea] focus:bg-white focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </label>
      </div>

      {/* Vùng bảng – tự cuộn bên trong, tiêu đề cột dính trên cùng */}
      <div className="min-h-0 flex-1 overflow-auto">
        {shown.length === 0 ? (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 py-14 text-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b8c1d6" strokeWidth="1.4" aria-hidden>
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <p className="mt-3 text-sm font-semibold text-[#0f1a2e]">
              {rows.length === 0 ? "Không có dữ liệu trong khoảng thời gian này" : "Không tìm thấy mã phù hợp"}
            </p>
            <p className="mt-1 text-xs text-[#8a94ad]">
              {rows.length === 0 ? "Thử chọn khoảng ngày rộng hơn." : "Thử từ khóa khác."}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f6f8fc]/95 backdrop-blur">
                <th className="w-14 border-b border-[#e3e8f2] px-4 py-3 text-left text-xs font-semibold text-[#8a94ad] sm:px-5">#</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.field}
                    className={`border-b border-[#e3e8f2] px-4 py-2.5 ${c.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <span className="block text-[13px] font-semibold text-[#1d2b4a]">{c.label}</span>
                    <span className="block font-mono text-[10.5px] font-normal text-[#9a7838]">{c.field}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const done = r.GAMNG > 0 && r.soluongkhacthucte >= r.GAMNG;
                const pct = r.GAMNG > 0 ? Math.min(100, (r.soluongkhacthucte / r.GAMNG) * 100) : 0;
                return (
                  <tr key={r.AUFNR} className="border-b border-[#f0f3f8] transition-colors odd:bg-white even:bg-[#fafbfe] hover:bg-[#eef3ff]">
                    <td className="px-4 py-3 tabular-nums text-[#a3acc2] sm:px-5">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-[#0f1a2e]">{r.AUFNR}</td>
                    <td className="px-4 py-3 text-[#3d4a66]">{r.mahang || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#3d4a66]">{nf.format(r.GAMNG)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {r.GAMNG > 0 && (
                          <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[#e8ecf4] md:block">
                            <span
                              className={`block h-full rounded-full ${done ? "bg-[#16a35a]" : "bg-[#2f5bea]"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        )}
                        <span className={`min-w-10 text-right font-semibold tabular-nums ${done ? "text-[#16a35a]" : "text-[#1d3f8f]"}`}>
                          {nf.format(r.soluongkhacthucte)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#5b6785]">{formatDateTime(r.time_new_update)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}