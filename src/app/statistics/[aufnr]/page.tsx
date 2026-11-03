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
    <div className="min-h-screen bg-[#eef2f9] lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <BackgroundLight
          className="min-h-screen"
          contentClassName={`${appFont.className} flex flex-col gap-4 p-4 pb-10 sm:p-6 sm:pb-12 xl:px-8`}
        >
          <Suspense fallback={<DetailSkeleton />}>
            <AufnrDetailView params={params} searchParams={searchParams} />
          </Suspense>
        </BackgroundLight>
      </main>
    </div>
  );
}