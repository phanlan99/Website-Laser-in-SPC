"use client";

import { useRef, useState } from "react";
import Pagination, { paginate } from "@/components/statistics/Pagination";
import type { HistoryRecord } from "@/lib/history";
import { formatDateTime } from "@/lib/statistics-url";

type Tab = "all" | "ok" | "error";

type Props = {
  /** Mới nhất ở trên */
  records: HistoryRecord[];
  gamng: number;
  rangeLabel: string;
};

const nf = new Intl.NumberFormat("vi-VN");

const COLUMNS = [
  { label: "Thời gian khắc", field: "time_record", align: "left" },
  { label: "Kết quả", field: "soluongkhac", align: "left" },
  { label: "Thứ tự", field: "lũy kế", align: "right" },
  { label: "Mã nhân viên", field: "Code", align: "left" },
  { label: "Tên nhân viên", field: "Name", align: "left" },
  { label: "ID", field: "id", align: "right" },
] as const;

/** Lịch sử từng lần khắc của 1 AUFNR – lọc Thành công / Lỗi, có phân trang */
export default function AufnrRecordsTable({ records, gamng, rangeLabel }: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Thứ tự sản phẩm khắc thành công (đếm từ lần cũ nhất lên)
  const order = new Map<number, number>();
  let n = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].soluongkhac === 1) order.set(records[i].id, ++n);
  }

  const okCount = records.filter((r) => r.soluongkhac === 1).length;
  const errCount = records.length - okCount;
  const filtered =
    tab === "ok" ? records.filter((r) => r.soluongkhac === 1) : tab === "error" ? records.filter((r) => r.soluongkhac !== 1) : records;
  const { current, start, slice } = paginate(filtered, page, pageSize);

  const toTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const tabs: { key: Tab; label: string; count: number; dot: string }[] = [
    { key: "all", label: "Tất cả", count: records.length, dot: "bg-[#8a94ad]" },
    { key: "ok", label: "Thành công", count: okCount, dot: "bg-[#16a35a]" },
    { key: "error", label: "Lỗi", count: errCount, dot: "bg-[#d92d20]" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e3e8f2] bg-white/85 shadow-[0_1px_2px_rgba(16,24,40,.04),0_12px_32px_-16px_rgba(16,24,40,.18)] backdrop-blur-md">
      <div className="flex flex-col gap-3 border-b border-[#edf1f7] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0f1a2e]">Lịch sử từng lần khắc</h2>
          <p className="mt-0.5 text-xs text-[#8a94ad]">
            {rangeLabel} · soluongkhac: 1 = thành công, 0 = lỗi / dừng khẩn cấp
          </p>
        </div>
        <div className="flex rounded-lg bg-[#eef2f9] p-1" role="tablist" aria-label="Lọc kết quả">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
                toTop();
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition sm:flex-none ${
                tab === t.key ? "bg-white text-[#0f1a2e] shadow-sm" : "text-[#5b6785] hover:text-[#0f1a2e]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden />
              {t.label}
              <span className="tabular-nums text-[#8a94ad]">{nf.format(t.count)}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#0f1a2e]">
              {tab === "error" ? "Không có lần khắc lỗi nào" : "Không có dữ liệu"}
            </p>
            {tab === "error" && <p className="mt-1 text-xs text-[#16a35a]">Mã này khắc ổn định 👍</p>}
          </div>
        ) : (
          <table className="w-full min-w-[860px] border-collapse text-sm">
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
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => {
                const ok = r.soluongkhac === 1;
                const no = order.get(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-[#f0f3f8] transition-colors ${
                      ok ? "odd:bg-white even:bg-[#fafbfe] hover:bg-[#eef3ff]" : "bg-[#fff6f5] hover:bg-[#ffeceb]"
                    }`}
                  >
                    <td className="px-4 py-3 tabular-nums text-[#a3acc2] sm:px-5">{start + i + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#0f1a2e]">{formatDateTime(r.time_record)}</td>
                    <td className="px-4 py-3">
                      {ok ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f6ec] px-2.5 py-0.5 text-xs font-semibold text-[#117a43]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12l5 5 9-10" />
                          </svg>
                          Thành công · 1
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdecec] px-2.5 py-0.5 text-xs font-semibold text-[#b42318]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                            <path d="M6 6l12 12M18 6 6 18" />
                          </svg>
                          Lỗi · 0
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {no ? (
                        <span className="font-semibold text-[#1d3f8f]">
                          {nf.format(no)}
                          {gamng > 0 && <span className="font-normal text-[#a3acc2]"> / {nf.format(gamng)}</span>}
                        </span>
                      ) : (
                        <span className="text-[#a3acc2]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#3d4a66]">{r.Code || "—"}</td>
                    <td className="px-4 py-3 text-[#0f1a2e]">{r.Name || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[#a3acc2]">{r.id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        total={filtered.length}
        page={current}
        pageSize={pageSize}
        unit="lần khắc"
        onPage={(p) => {
          setPage(p);
          toTop();
        }}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
          toTop();
        }}
      />
    </div>
  );
}