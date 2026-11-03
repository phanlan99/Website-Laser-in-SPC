import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import BackgroundLight from "@/components/BackgroundLight";
import { DataSkeleton, FilterSkeleton, StatisticsData, StatisticsFilter } from "@/components/statistics/StatisticsContent";
import type { HistorySearchParams } from "@/lib/history";
import { appFont } from "@/lib/fonts";

type PageProps = {
  searchParams: Promise<HistorySearchParams>;
};

/**
 * Trang thống kê: tiêu đề → bộ lọc → thẻ số liệu → biểu đồ → bảng chi tiết (cuộn xuống)
 * Phần động (đọc URL, truy vấn DB) nằm trong <Suspense> theo yêu cầu của cacheComponents.
 */
export default function StatisticsPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-[#eef2f9] lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <BackgroundLight
          className="min-h-screen"
          contentClassName={`${appFont.className} flex flex-col gap-4 p-4 pb-10 sm:p-6 sm:pb-12 xl:px-8`}
        >
          {/* Tiêu đề gọn 1 dòng */}
          <header className="flex items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1d3f8f] text-white shadow-sm" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <path d="M3 21h18M6 17v-6M11 17V6M16 17v-4M20 17V8" />
                </svg>
              </span>
              <h1 className="truncate text-xl font-bold text-[#0f1a2e]">Thống kê khắc laser</h1>
              <span className="hidden shrink-0 rounded-full border border-[#ecdcbc] bg-[#f7efdf] px-2.5 py-0.5 text-[11px] font-semibold text-[#86662c] sm:inline">
                Theo mã AUFNR
              </span>
            </div>
          </header>

          <Suspense fallback={<FilterSkeleton />}>
            <StatisticsFilter searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<DataSkeleton />}>
            <StatisticsData searchParams={searchParams} />
          </Suspense>
        </BackgroundLight>
      </main>
    </div>
  );
}