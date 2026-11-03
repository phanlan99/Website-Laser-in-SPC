import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import BackgroundLight from "@/components/BackgroundLight";
import { AufnrDetailView, DetailSkeleton, type DetailSearchParams } from "@/components/statistics/AufnrDetailContent";
import { appFont } from "@/lib/fonts";

type PageProps = {
  params: Promise<{ aufnr: string }>;
  searchParams: Promise<DetailSearchParams>;
};

/**
 * /statistics/[aufnr] – thống kê chi tiết 1 mã AUFNR.
 * Giữ nguyên bộ lọc của trang thống kê trên URL để nút quay lại đưa về đúng chỗ.
 * ?scope=all → xem toàn bộ thời gian thay vì khoảng ngày đang lọc.
 */
export default function AufnrDetailPage({ params, searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-[#eef2f9] lg:flex lg:h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 lg:h-screen">
        <BackgroundLight
          className="min-h-full lg:h-full"
          contentClassName={`${appFont.className} flex min-h-[calc(100dvh-61px)] flex-col gap-4 p-4 sm:p-6 lg:h-full lg:min-h-0 xl:px-8`}
        >
          <Suspense fallback={<DetailSkeleton />}>
            <AufnrDetailView params={params} searchParams={searchParams} />
          </Suspense>
        </BackgroundLight>
      </main>
    </div>
  );
}