"use client";

import { useState, type CSSProperties } from "react";
import { C, EmptyChart, Tip, TipRow, nf, niceTicks, useInView, useWidth } from "@/components/charts/chart-kit";

export type ProgressPoint = {
  /** Thứ tự lần ghi (1, 2, 3…) */
  i: number;
  /** Số đã khắc thành công tích lũy */
  cum: number;
  ok: boolean;
  time: string;
  who: string;
};

type Props = {
  points: ProgressPoint[];
  /** Đường mục tiêu (GAMNG) */
  target: number;
  height?: number;
};

const PAD = { l: 40, r: 14, t: 16, b: 26 };

/**
 * Đường tiến độ khắc tích lũy theo từng lần ghi:
 * - đường vẽ dần từ trái sang phải, vùng dưới đường hiện mờ dần
 * - chấm đỏ là lần khắc lỗi, nét đứt là mục tiêu GAMNG
 */
export default function ProgressLineChart({ points, target, height = 260 }: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [hot, setHot] = useState<number | null>(null);

  if (points.length === 0) return <EmptyChart height={height} />;

  const maxY = Math.max(target, ...points.map((p) => p.cum), 1);
  const ticks = niceTicks(maxY);
  const top = ticks[ticks.length - 1];
  const n = points[points.length - 1].i;
  const iw = Math.max(0, width - PAD.l - PAD.r);
  const ih = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (n <= 1 ? iw / 2 : ((i - 1) / (n - 1)) * iw);
  const y = (v: number) => PAD.t + ih - (v / top) * ih;

  // Đường bậc thang: giữ ngang tới lần ghi tiếp theo rồi mới tăng
  let d = `M${x(points[0].i)},${y(points[0].cum)}`;
  for (let k = 1; k < points.length; k++) {
    d += ` H${x(points[k].i)} V${y(points[k].cum)}`;
  }
  const area = `${d} V${y(0)} H${x(points[0].i)} Z`;
  const errors = points.filter((p) => !p.ok);
  const xTicks = n <= 1 ? [1] : Array.from(new Set([1, Math.round(n * 0.25), Math.round(n * 0.5), Math.round(n * 0.75), n])).filter((v) => v >= 1);

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const target = 1 + rel * (n - 1);
    let best = 0;
    for (let k = 1; k < points.length; k++) {
      if (Math.abs(points[k].i - target) < Math.abs(points[best].i - target)) best = k;
    }
    setHot(best);
  };

  const hp = hot !== null ? points[hot] : null;

  return (
    <div ref={ref} data-in={inView} className="relative">
      <div ref={box} className="w-full">
        {width > 0 ? (
          <svg width={width} height={height} role="img" aria-label="Biểu đồ tiến độ khắc">
            <defs>
              <linearGradient id="lm-prog-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.ok} stopOpacity=".28" />
                <stop offset="1" stopColor={C.ok} stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((t, i) => (
              <g key={t} className="ch-fade" style={{ "--d": `${i * 60}ms` } as CSSProperties}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke={i === 0 ? "#d5dbe7" : C.grid} strokeDasharray={i === 0 ? undefined : "3 4"} />
                <text x={PAD.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={C.axis}>
                  {nf.format(t)}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={x(t)} y={height - 8} textAnchor="middle" fontSize="11" fill={C.axis} className="ch-fade">
                #{t}
              </text>
            ))}

            {target > 0 && (
              <g className="ch-fade" style={{ "--d": "900ms" } as CSSProperties}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(target)} y2={y(target)} stroke={C.done} strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={width - PAD.r} y={y(target) - 6} textAnchor="end" fontSize="11" fontWeight="600" fill={C.done}>
                  Mục tiêu {nf.format(target)}
                </text>
              </g>
            )}

            <path d={area} fill="url(#lm-prog-area)" className="ch-area" style={{ "--d": "700ms" } as CSSProperties} />
            <path d={d} pathLength={1} fill="none" stroke={C.ok} strokeWidth="2.4" strokeLinejoin="round" className="ch-line" />

            {errors.map((p) => (
              <circle
                key={p.i}
                cx={x(p.i)}
                cy={y(p.cum)}
                r="4.5"
                fill="#fff"
                stroke={C.err}
                strokeWidth="2.2"
                className="ch-dot"
                style={{ "--d": `${400 + ((p.i - 1) / Math.max(1, n - 1)) * 1400}ms` } as CSSProperties}
              />
            ))}
            {/* Điểm cuối */}
            <circle cx={x(n)} cy={y(points[points.length - 1].cum)} r="5" fill={C.ok} stroke="#fff" strokeWidth="2" className="ch-dot" style={{ "--d": "1600ms" } as CSSProperties} />

            {hp && (
              <g pointerEvents="none">
                <line x1={x(hp.i)} x2={x(hp.i)} y1={PAD.t} y2={y(0)} stroke="#b8c1d6" strokeDasharray="3 3" />
                <circle cx={x(hp.i)} cy={y(hp.cum)} r="5.5" fill={hp.ok ? C.ok : C.err} stroke="#fff" strokeWidth="2" />
              </g>
            )}
            <rect x={PAD.l} y={PAD.t} width={iw} height={ih} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHot(null)} />
          </svg>
        ) : (
          <div style={{ height }} />
        )}
      </div>

      {hp && width > 0 && (
        <Tip x={Math.min(Math.max(x(hp.i), 90), width - 90)} y={y(hp.cum)}>
          <p className="font-semibold text-[#0f1a2e]">Lần ghi #{hp.i}</p>
          <p className="text-[#8a94ad]">{hp.time}</p>
          <TipRow color={hp.ok ? C.ok : C.err} label="Kết quả" value={hp.ok ? "Thành công" : "Lỗi"} />
          <TipRow color={C.ok} label="Đã khắc tích lũy" value={target > 0 ? `${nf.format(hp.cum)} / ${nf.format(target)}` : nf.format(hp.cum)} />
          {hp.who && <p className="mt-1.5 border-t border-[#edf1f7] pt-1.5 text-[#5b6785]">{hp.who}</p>}
        </Tip>
      )}
    </div>
  );
}