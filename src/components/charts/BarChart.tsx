"use client";

import { useState, type CSSProperties } from "react";
import { C, EmptyChart, Tip, TipRow, compact, nf, niceTicks, useInView, useWidth } from "@/components/charts/chart-kit";

export type BarSeries = { name: string; color: string };
export type BarDatum = { label: string; title?: string; values: number[] };

type Props = {
  data: BarDatum[];
  /** Các lớp chồng lên nhau, phần tử đầu ở dưới cùng */
  series: BarSeries[];
  height?: number;
  /** Hiện tổng trên đầu cột khi số cột ít */
  showTotals?: boolean;
  /** Dòng phụ trong tooltip, vd tỉ lệ lỗi */
  extra?: (d: BarDatum) => string | null;
};

const PAD = { l: 40, r: 8, t: 18, b: 26 };

/** Biểu đồ cột chồng – cột mọc từ đáy lên lần lượt, rê chuột xem chi tiết */
export default function BarChart({ data, series, height = 260, showTotals = true, extra }: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [hot, setHot] = useState<number | null>(null);

  const totals = data.map((d) => d.values.reduce((s, v) => s + v, 0));
  const max = Math.max(0, ...totals);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, width - PAD.l - PAD.r);
  const ih = height - PAD.t - PAD.b;
  const band = data.length ? iw / data.length : 0;
  const bw = Math.max(3, Math.min(34, band * 0.62));
  const y = (v: number) => PAD.t + ih - (v / top) * ih;
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(iw / 46))));
  const stagger = Math.min(40, 900 / Math.max(1, data.length));

  return (
    <div ref={ref} data-in={inView} className="relative">
      <div ref={box} className="w-full">
        {max === 0 ? (
          <EmptyChart height={height} />
        ) : width > 0 ? (
          <svg width={width} height={height} className={hot !== null ? "ch-dim" : ""} onMouseLeave={() => setHot(null)} role="img" aria-label="Biểu đồ cột">
            {/* Lưới + trục Y */}
            {ticks.map((t, i) => (
              <g key={t} className="ch-fade" style={{ "--d": `${i * 60}ms` } as CSSProperties}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke={i === 0 ? "#d5dbe7" : C.grid} strokeDasharray={i === 0 ? undefined : "3 4"} />
                <text x={PAD.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={C.axis}>
                  {compact(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => {
              const cx = PAD.l + band * i + band / 2;
              let acc = 0;
              return (
                <g key={d.label + i} className={`ch-item ${hot === i ? "is-hot" : ""}`}>
                  {/* Vùng bắt chuột cả chiều cao */}
                  <rect x={PAD.l + band * i} y={PAD.t} width={band} height={ih} fill={hot === i ? "rgba(47,91,234,.06)" : "transparent"} rx="6" onMouseEnter={() => setHot(i)} />
                  <g className="ch-bar" style={{ "--d": `${i * stagger}ms` } as CSSProperties} pointerEvents="none">
                    {d.values.map((v, si) => {
                      if (v <= 0) return null;
                      const y0 = y(acc);
                      acc += v;
                      const y1 = y(acc);
                      const isTop = d.values.slice(si + 1).every((x) => x <= 0);
                      const h = Math.max(1, y0 - y1);
                      const r = isTop ? Math.min(5, bw / 2, h) : 0;
                      // Bo tròn 2 góc trên của lớp trên cùng
                      return (
                        <path
                          key={si}
                          d={`M${cx - bw / 2},${y0} V${y1 + r} Q${cx - bw / 2},${y1} ${cx - bw / 2 + r},${y1} H${cx + bw / 2 - r} Q${cx + bw / 2},${y1} ${cx + bw / 2},${y1 + r} V${y0} Z`}
                          fill={series[si]?.color ?? C.ok}
                        />
                      );
                    })}
                  </g>
                  {showTotals && data.length <= 16 && totals[i] > 0 && band > 26 && (
                    <text x={cx} y={y(totals[i]) - 6} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#3d4a66" className="ch-fade" style={{ "--d": `${700 + i * stagger}ms` } as CSSProperties} pointerEvents="none">
                      {compact(totals[i])}
                    </text>
                  )}
                  {i % labelEvery === 0 && (
                    <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill={hot === i ? C.ink : C.axis} fontWeight={hot === i ? 600 : 400} pointerEvents="none">
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          <div style={{ height }} />
        )}
      </div>

      {hot !== null && data[hot] && width > 0 && (
        <Tip x={Math.min(Math.max(PAD.l + band * hot + band / 2, 80), width - 80)} y={y(totals[hot])}>
          <p className="font-semibold text-[#0f1a2e]">{data[hot].title ?? data[hot].label}</p>
          {series.map((s, si) => (
            <TipRow key={s.name} color={s.color} label={s.name} value={nf.format(data[hot].values[si] ?? 0)} />
          ))}
          {extra?.(data[hot]) && <p className="mt-1.5 border-t border-[#edf1f7] pt-1.5 text-[#5b6785]">{extra(data[hot])}</p>}
        </Tip>
      )}
    </div>
  );
}