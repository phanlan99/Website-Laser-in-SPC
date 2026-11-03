"use client";

import { useState, type CSSProperties } from "react";
import { EmptyChart, nf, useCountUp, useInView } from "@/components/charts/chart-kit";

export type DonutDatum = { label: string; value: number; color: string; hint?: string };

type Props = {
  data: DonutDatum[];
  centerLabel: string;
  /** Số ở giữa (mặc định = tổng) */
  centerValue?: number;
  centerSuffix?: string;
  size?: number;
};

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
}

/** Biểu đồ tròn (donut) – các cung vẽ nối tiếp nhau, số giữa đếm tăng dần */
export default function DonutChart({ data, centerLabel, centerValue, centerSuffix = "", size = 184 }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [hot, setHot] = useState<number | null>(null);
  const items = data.filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);
  const shown = hot !== null ? items[hot].value : (centerValue ?? total);
  const counted = useCountUp(shown, inView, hot !== null ? 350 : 1300);

  if (total === 0) return <EmptyChart height={size} />;

  const r = size / 2 - 14;
  const c = size / 2;
  const gap = items.length > 1 ? 0.025 : 0;
  let a = -Math.PI / 2;
  const dur = 900;

  return (
    <div ref={ref} data-in={inView} className="@container">
      <div className="flex flex-col items-center gap-4 @[440px]:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={hot !== null ? "ch-dim" : ""} role="img" aria-label={centerLabel}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="#eef2f9" strokeWidth="18" />
          {items.map((d, i) => {
            const span = (d.value / total) * Math.PI * 2;
            const a0 = a + gap / 2;
            const a1 = a + span - gap / 2;
            const delay = (a + Math.PI / 2) / (Math.PI * 2) * dur;
            a += span;
            const full = items.length === 1;
            return (
              <path
                key={d.label}
                d={full ? `${arcPath(c, c, r, -Math.PI / 2, Math.PI / 2)} ${arcPath(c, c, r, Math.PI / 2, (3 * Math.PI) / 2).replace("M", "L")}` : arcPath(c, c, r, a0, Math.max(a0 + 0.001, a1))}
                pathLength={1}
                fill="none"
                stroke={d.color}
                strokeWidth={hot === i ? 24 : 18}
                strokeLinecap="butt"
                className={`ch-arc ch-item ch-hot-arc ${hot === i ? "is-hot" : ""}`}
                style={{ "--d": `${delay}ms` } as CSSProperties}
                onMouseEnter={() => setHot(i)}
                onMouseLeave={() => setHot(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[22px] font-bold tabular-nums leading-none text-[#0f1a2e]">
            {nf.format(Math.round(counted))}
            {centerSuffix}
          </span>
          <span className="mt-1 max-w-[70%] text-[11px] leading-tight text-[#8a94ad]">{hot !== null ? items[hot].label : centerLabel}</span>
        </div>
      </div>

      <ul className={`w-full min-w-0 flex-1 space-y-1.5 ${hot !== null ? "ch-dim" : ""}`}>
        {items.map((d, i) => (
          <li
            key={d.label}
            className={`ch-item ch-fade flex items-center gap-2 rounded-lg px-2 py-1 text-xs ${hot === i ? "is-hot bg-[#f3f6fc]" : ""}`}
            style={{ "--d": `${300 + i * 80}ms` } as CSSProperties}
            onMouseEnter={() => setHot(i)}
            onMouseLeave={() => setHot(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate font-medium text-[#3d4a66]" title={d.label}>
              {d.label}
            </span>
            <span className="tabular-nums text-[#8a94ad]">{nf.format(d.value)}</span>
            <b className="w-12 text-right tabular-nums text-[#0f1a2e]">{((d.value / total) * 100).toFixed(1)}%</b>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}