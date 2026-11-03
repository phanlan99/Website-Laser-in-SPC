import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import BackgroundLight from "@/components/BackgroundLight";
import { DataSkeleton, FilterSkeleton, StatisticsData, StatisticsFilter } from "@/components/statistics/StatisticsContent";
import { appFont } from "@/lib/fonts";

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

/**
 * Trang thống kê – layout toàn màn hình:
 * - Desktop: cao đúng 1 màn hình, bảng chiếm phần còn lại và tự cuộn bên trong
 * - Mobile: cuộn bình thường
 * Phần động (đọc URL, truy vấn DB) nằm trong <Suspense> theo yêu cầu của cacheComponents.
 */
export default function StatisticsPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-[#eef2f9] lg:flex lg:h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 lg:h-screen">
        <BackgroundLight
          className="min-h-full lg:h-full"
          contentClassName={`${appFont.className} flex min-h-[calc(100dvh-61px)] flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:h-full lg:min-h-0 xl:px-8`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <header>
              <p className="text-xs font-semibold text-[#9a7838]">Laser Marking · Báo cáo sản xuất</p>
              <h1 className="mt-1 text-2xl font-bold text-[#0f1a2e] sm:text-[28px]">Thống kê khắc laser</h1>
              <p className="mt-1 text-sm text-[#5b6785]">Tổng hợp số lượng khắc theo mã AUFNR</p>
            </header>
            <Suspense fallback={<FilterSkeleton />}>
              <StatisticsFilter searchParams={searchParams} />
            </Suspense>
          </div>

          <Suspense fallback={<DataSkeleton />}>
            <StatisticsData searchParams={searchParams} />
          </Suspense>
        </BackgroundLight>
      </main>
    </div>
  );
}