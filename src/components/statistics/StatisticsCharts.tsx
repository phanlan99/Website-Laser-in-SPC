"use client";

import BarChart from "@/components/charts/BarChart";
import DonutChart, { type DonutDatum } from "@/components/charts/DonutChart";
import HBarChart, { type HBarDatum } from "@/components/charts/HBarChart";
import { C, ChartCard, Legend, nf } from "@/components/charts/chart-kit";
import type { HourPoint, TrendPoint } from "@/lib/history";

export type StatisticsChartsProps = {
  granularity: "day" | "month";
  trend: TrendPoint[];
  hourly: HourPoint[];
  status: { done: number; progress: number; idle: number };
  productTypes: DonutDatum[];
  topCodes: HBarDatum[];
  topErrors: HBarDatum[];
};

const SERIES = [
  { name: "Khắc thành công", color: C.ok },
  { name: "Khắc lỗi", color: C.err },
];

const errRate = (ok: number, err: number) => {
  const t = ok + err;
  return t > 0 ? `Tỉ lệ lỗi ${((err / t) * 100).toFixed(1)}%` : null;
};

/** Cụm biểu đồ trang /statistics */
export default function StatisticsCharts(p: StatisticsChartsProps) {
  const totalOk = p.trend.reduce((s, t) => s + t.ok, 0);
  const totalErr = p.trend.reduce((s, t) => s + t.err, 0);
  const peak = p.trend.reduce((b, t) => (t.ok > b.ok ? t : b), p.trend[0] ?? { label: "—", ok: 0 });
  const busiest = p.hourly.reduce((b, h) => (h.ok + h.err > b.ok + b.err ? h : b), p.hourly[0]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ChartCard
        className="lg:col-span-2"
        title={p.granularity === "day" ? "Sản lượng khắc theo ngày" : "Sản lượng khắc theo tháng"}
        subtitle={`${nf.format(totalOk)} thành công · ${nf.format(totalErr)} lỗi${peak.ok > 0 ? ` · cao nhất ${peak.label} (${nf.format(peak.ok)})` : ""}`}
        right={<Legend items={SERIES} />}
      >
        <BarChart
          data={p.trend.map((t) => ({ label: t.label, title: t.label, values: [t.ok, t.err] }))}
          series={SERIES}
          extra={(d) => errRate(d.values[0], d.values[1])}
        />
      </ChartCard>

      <ChartCard title="Tình trạng các mã AUFNR" subtitle="So sánh Đã khắc với Số lượng">
        <DonutChart
          centerLabel="mã AUFNR"
          data={[
            { label: "Đã khắc đủ", value: p.status.done, color: C.done },
            { label: "Đang khắc", value: p.status.progress, color: C.progress },
            { label: "Chưa khắc được", value: p.status.idle, color: C.idle },
          ]}
        />
      </ChartCard>

      <ChartCard title="Tỉ trọng theo Loại hàng" subtitle="Theo số lượng đã khắc">
        <DonutChart centerLabel="đã khắc" data={p.productTypes} />
      </ChartCard>

      <ChartCard title="Top Mã viết tắt" subtitle="Đã khắc so với số lượng cần khắc">
        <HBarChart data={p.topCodes} color={C.ok} targetColor="#e2e8f5" empty="Chưa có mã viết tắt" />
      </ChartCard>

      <ChartCard title="Mã AUFNR khắc lỗi nhiều nhất" subtitle="Bấm để xem chi tiết từng lần khắc">
        <HBarChart data={p.topErrors} color={C.err} valueSuffix=" lỗi" empty="Không có mã nào bị lỗi 🎉" />
      </ChartCard>

      <ChartCard
        className="lg:col-span-2 xl:col-span-3"
        title="Phân bố theo giờ trong ngày"
        subtitle={busiest && busiest.ok + busiest.err > 0 ? `Giờ cao điểm: ${busiest.hour}h – ${busiest.hour + 1}h (${nf.format(busiest.ok + busiest.err)} lần khắc)` : "Số lần khắc theo từng khung giờ"}
        right={<Legend items={SERIES} />}
      >
        <BarChart
          height={220}
          data={p.hourly.map((h) => ({ label: `${h.hour}h`, title: `${h.hour}:00 – ${h.hour}:59`, values: [h.ok, h.err] }))}
          series={SERIES}
          showTotals={false}
          extra={(d) => errRate(d.values[0], d.values[1])}
        />
      </ChartCard>
    </div>
  );
}