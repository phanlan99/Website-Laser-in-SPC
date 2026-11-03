"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { EmptyChart, nf, useCountUp, useInView } from "@/components/charts/chart-kit";

export type HBarDatum = {
  label: string;
  sub?: string;
  value: number;
  /** Vạch mục tiêu mờ phía sau (vd số lượng cần khắc) */
  target?: number;
  href?: string;
};

type Props = {
  data: HBarDatum[];
  color: string;
  /** Màu vạch mục tiêu */
  targetColor?: string;
  valueSuffix?: string;
  empty?: string;
};

function Value({ v, active, suffix }: { v: number; active: boolean; suffix: string }) {
  const n = useCountUp(v, active, 1100);
  return (
    <span className="tabular-nums">
      {nf.format(Math.round(n))}
      {suffix}
    </span>
  );
}

/** Biểu đồ thanh ngang xếp hạng – thanh trượt ra lần lượt, số đếm tăng dần */
export default function HBarChart({ data, color, targetColor = "#e8ecf4", valueSuffix = "", empty }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.target ?? 0)));

  if (data.length === 0) return <EmptyChart height={220} text={empty} />;

  return (
    <div ref={ref} data-in={inView} className="space-y-2.5">
      {data.map((d, i) => {
        const row = (
          <>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate">
                <span className="font-semibold text-[#0f1a2e]">{d.label}</span>
                {d.sub && <span className="ml-1.5 text-[#8a94ad]">{d.sub}</span>}
              </span>
              <span className="shrink-0 font-semibold text-[#0f1a2e]">
                <Value v={d.value} active={inView} suffix={valueSuffix} />
                {d.target !== undefined && <span className="font-normal text-[#a3acc2]"> / {nf.format(d.target)}</span>}
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-[#f1f4f9]">
              {d.target !== undefined && (
                <div
                  className="ch-hbar absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${(d.target / max) * 100}%`, background: targetColor, "--d": `${i * 70}ms` } as CSSProperties}
                />
              )}
              <div
                className="ch-hbar absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.max(1.5, (d.value / max) * 100)}%`,
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                  "--d": `${120 + i * 70}ms`,
                } as CSSProperties}
              />
            </div>
          </>
        );
        return d.href ? (
          <Link key={d.label} href={d.href} className="-mx-2 block rounded-lg px-2 py-1 transition hover:bg-[#f3f6fc]">
            {row}
          </Link>
        ) : (
          <div key={d.label} className="py-1">
            {row}
          </div>
        );
      })}
    </div>
  );
}