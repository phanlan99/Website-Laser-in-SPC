"use client";

import type { CSSProperties } from "react";
import { C, nf, useCountUp, useInView } from "@/components/charts/chart-kit";

type Props = {
  value: number;
  max: number;
  errors: number;
  size?: number;
};

/** Đồng hồ tiến độ hình vòng cung 270° – kim quét và số % đếm tăng dần */
export default function GaugeChart({ value, max, errors, size = 210 }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const pct = max > 0 ? (value / max) * 100 : 0;
  const frac = Math.min(1, pct / 100);
  const shownPct = useCountUp(pct, inView, 1400);
  const done = max > 0 && value >= max;

  const r = size / 2 - 16;
  const c = size / 2;
  const start = (135 * Math.PI) / 180;
  const sweep = (270 * Math.PI) / 180;
  const pt = (a: number) => [c + r * Math.cos(a), c + r * Math.sin(a)];
  const [x0, y0] = pt(start);
  const [x1, y1] = pt(start + sweep);
  const arc = `M${x0},${y0} A${r},${r} 0 1 1 ${x1},${y1}`;
  const color = done ? C.done : C.ok;

  // Vạch chia 0–100%
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = start + (sweep * i) / 10;
    const [ax, ay] = [c + (r - 15) * Math.cos(a), c + (r - 15) * Math.sin(a)];
    const [bx, by] = [c + (r - (i % 5 === 0 ? 23 : 19)) * Math.cos(a), c + (r - (i % 5 === 0 ? 23 : 19)) * Math.sin(a)];
    return { ax, ay, bx, by, major: i % 5 === 0 };
  });

  return (
    <div ref={ref} data-in={inView} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.86 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Hoàn thành ${pct.toFixed(1)}%`}>
          <defs>
            <linearGradient id="lm-gauge" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor={done ? "#34c27a" : "#6a55d8"} />
              <stop offset="1" stopColor={color} />
            </linearGradient>
          </defs>
          <path d={arc} fill="none" stroke="#eef2f9" strokeWidth="16" strokeLinecap="round" />
          {ticks.map((t, i) => (
            <line key={i} x1={t.ax} y1={t.ay} x2={t.bx} y2={t.by} stroke={t.major ? "#b8c1d6" : "#dfe5ef"} strokeWidth={t.major ? 1.6 : 1} strokeLinecap="round" />
          ))}
          <path
            d={arc}
            pathLength={1}
            fill="none"
            stroke="url(#lm-gauge)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${frac} 1`}
            className="ch-gauge"
            style={{ "--frac": frac } as CSSProperties}
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[34%] flex flex-col items-center">
          <span className="text-[34px] font-bold tabular-nums leading-none text-[#0f1a2e]">
            {shownPct.toFixed(1)}
            <span className="text-lg text-[#8a94ad]">%</span>
          </span>
          <span className="mt-1.5 text-xs text-[#5b6785]">
            <b className="tabular-nums text-[#0f1a2e]">{nf.format(value)}</b> / {nf.format(max)} sản phẩm
          </span>
        </div>
      </div>
      <div className="ch-fade mt-1 flex gap-2" style={{ "--d": "900ms" } as CSSProperties}>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${done ? "bg-[#e6f6ec] text-[#117a43]" : "bg-[#eaf0ff] text-[#1d3f8f]"}`}>
          {done ? "Đã khắc đủ" : `Còn ${nf.format(Math.max(0, max - value))}`}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${errors ? "bg-[#fdecec] text-[#b42318]" : "bg-[#f1f4f9] text-[#5b6785]"}`}>
          {nf.format(errors)} lần lỗi
        </span>
      </div>
    </div>
  );
}