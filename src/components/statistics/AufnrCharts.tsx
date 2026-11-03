"use client";

import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import GaugeChart from "@/components/charts/GaugeChart";
import HBarChart, { type HBarDatum } from "@/components/charts/HBarChart";
import ProgressLineChart, { type ProgressPoint } from "@/components/charts/ProgressLineChart";
import { C, ChartCard, Legend, nf } from "@/components/charts/chart-kit";

export type AufnrChartsProps = {
  done: number;
  gamng: number;
  errors: number;
  records: number;
  points: ProgressPoint[];
  operators: HBarDatum[];
  hours: { hour: number; ok: number; err: number }[];
};

const SERIES = [
  { name: "Thành công", color: C.ok },
  { name: "Lỗi", color: C.err },
];

/** Cụm biểu đồ trang /statistics/[aufnr] */
export default function AufnrCharts(p: AufnrChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Tiến độ hoàn thành" subtitle="Đã khắc / Số lượng (GAMNG)">
        <div className="flex h-full items-center justify-center">
          <GaugeChart value={p.done} max={p.gamng} errors={p.errors} />
        </div>
      </ChartCard>

      <ChartCard
        className="lg:col-span-1 xl:col-span-2"
        title="Đường tiến độ khắc tích lũy"
        subtitle={`${nf.format(p.records)} lần ghi nhận · chấm đỏ là lần khắc lỗi`}
        right={
          <Legend
            items={[
              { name: "Đã khắc tích lũy", color: C.ok },
              { name: "Khắc lỗi", color: C.err },
              { name: "Mục tiêu", color: C.done },
            ]}
          />
        }
      >
        <ProgressLineChart points={p.points} target={p.gamng} />
      </ChartCard>

      <ChartCard title="Kết quả khắc" subtitle="soluongkhac: 1 thành công, 0 lỗi">
        <DonutChart
          centerLabel="lần ghi nhận"
          data={[
            { label: "Thành công", value: p.records - p.errors, color: C.ok },
            { label: "Lỗi / dừng khẩn cấp", value: p.errors, color: C.err },
          ]}
        />
      </ChartCard>

      <ChartCard title="Theo nhân viên" subtitle="Số lần thành công / tổng lần khắc">
        <HBarChart data={p.operators} color={C.ok} targetColor="#fbdada" empty="Chưa có thông tin nhân viên" />
      </ChartCard>

      <ChartCard className="lg:col-span-2 xl:col-span-1" title="Theo giờ" subtitle="Số lần khắc trong từng khung giờ" right={<Legend items={SERIES} />}>
        <BarChart
          height={230}
          data={p.hours.map((h) => ({ label: `${h.hour}h`, title: `${h.hour}:00 – ${h.hour}:59`, values: [h.ok, h.err] }))}
          series={SERIES}
        />
      </ChartCard>
    </div>
  );
}