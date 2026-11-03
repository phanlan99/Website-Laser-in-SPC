"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/* ==================================================================
   Bộ công cụ biểu đồ dùng chung (SVG thuần, không cần thư viện ngoài)
   - Animation chỉ chạy khi biểu đồ cuộn vào màn hình
   - Số liệu đếm tăng dần (count-up)
   - Tôn trọng prefers-reduced-motion
   ================================================================== */

export const PALETTE = ["#2f5bea", "#c9a25a", "#16a35a", "#6a55d8", "#0ea5a4", "#e0782f", "#d94c8a", "#64748b"];
export const C = {
  ok: "#2f5bea",
  okSoft: "#9db4ff",
  err: "#e5484d",
  done: "#16a35a",
  progress: "#2f5bea",
  idle: "#cbd5e1",
  grid: "#e8ecf4",
  axis: "#8a94ad",
  ink: "#0f1a2e",
};

export const nf = new Intl.NumberFormat("vi-VN");

/** Bật true khi phần tử xuất hiện trong màn hình (chỉ 1 lần) */
export function useInView<T extends Element>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/** Đo chiều rộng thật của khung để vẽ SVG sắc nét ở mọi kích thước */
export function useWidth<T extends Element>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Số đếm tăng dần từ 0 tới target khi active */
export function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = reduce ? 1 : Math.min(1, (t - t0) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

/** Mốc trục Y "đẹp" (1, 2, 5 × 10ⁿ) */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  // Dữ liệu là số đếm nên bước nhỏ nhất là 1
  const step = Math.max(1, [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag);
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

/** Rút gọn số lớn: 12.500 → 12,5K */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1000).toFixed(1).replace(".", ",")}K`;
  return nf.format(n);
}

/* ------------------------------------------------------------------ */
/*  CSS animation (React 19 tự gộp, chỉ chèn 1 lần dù nhiều biểu đồ)    */
/* ------------------------------------------------------------------ */
const CSS = `
.ch-bar{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0)}
.ch-hbar{transform-origin:0 50%;transform:scaleX(0)}
.ch-arc,.ch-line{stroke-dasharray:1 1;stroke-dashoffset:1}
.ch-gauge{stroke-dashoffset:var(--frac)}
.ch-dot{transform-box:fill-box;transform-origin:center;transform:scale(0)}
.ch-fade,.ch-area{opacity:0}
[data-in="true"] .ch-bar{animation:ch-grow-y .9s cubic-bezier(.22,1,.36,1) var(--d,0ms) forwards}
[data-in="true"] .ch-hbar{animation:ch-grow-x 1.1s cubic-bezier(.22,1,.36,1) var(--d,0ms) forwards}
[data-in="true"] .ch-arc{animation:ch-draw .9s cubic-bezier(.65,0,.35,1) var(--d,0ms) forwards}
[data-in="true"] .ch-line{animation:ch-draw 1.6s cubic-bezier(.45,0,.2,1) var(--d,0ms) forwards}
[data-in="true"] .ch-gauge{animation:ch-gauge 1.4s cubic-bezier(.22,1,.36,1) var(--d,0ms) forwards}
[data-in="true"] .ch-dot{animation:ch-pop .5s cubic-bezier(.34,1.56,.64,1) var(--d,0ms) forwards}
[data-in="true"] .ch-fade{animation:ch-fade .6s ease var(--d,0ms) forwards}
[data-in="true"] .ch-area{animation:ch-fade 1.2s ease var(--d,400ms) forwards}
.ch-item{transition:opacity .25s ease,filter .25s ease}
.ch-dim .ch-item:not(.is-hot){opacity:.32}
.ch-hot-arc{transition:stroke-width .25s ease}
@keyframes ch-grow-y{to{transform:scaleY(1)}}
@keyframes ch-grow-x{to{transform:scaleX(1)}}
@keyframes ch-draw{to{stroke-dashoffset:0}}
@keyframes ch-gauge{to{stroke-dashoffset:0}}
@keyframes ch-pop{to{transform:scale(1)}}
@keyframes ch-fade{to{opacity:1}}
@media (prefers-reduced-motion:reduce){
  .ch-bar,.ch-hbar,.ch-dot{transform:none!important;animation:none!important}
  .ch-arc,.ch-line,.ch-gauge{stroke-dashoffset:0!important;animation:none!important}
  .ch-fade,.ch-area{opacity:1!important;animation:none!important}
}
`;

export function ChartStyles() {
  return (
    <style href="lm-chart-kit" precedence="default">
      {CSS}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/*  Khung thẻ biểu đồ                                                  */
/* ------------------------------------------------------------------ */
export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-[#e3e8f2] bg-white/85 p-4 shadow-[0_1px_2px_rgba(16,24,40,.04),0_10px_28px_-14px_rgba(16,24,40,.16)] backdrop-blur-md sm:p-5 ${className}`}
    >
      <ChartStyles />
      <header className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#0f1a2e]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-[#8a94ad]">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((it) => (
        <li key={it.name} className="flex items-center gap-1.5 text-xs font-medium text-[#5b6785]">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: it.color }} aria-hidden />
          {it.name}
        </li>
      ))}
    </ul>
  );
}

/** Hộp chú thích khi rê chuột */
export function Tip({ x, y, children, align = "center" }: { x: number; y: number; children: ReactNode; align?: "center" | "left" | "right" }) {
  const tx = align === "center" ? "-50%" : align === "left" ? "0%" : "-100%";
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-36 rounded-xl border border-[#e3e8f2] bg-white/95 px-3 py-2 text-xs shadow-[0_12px_32px_-10px_rgba(16,24,40,.35)] backdrop-blur"
      style={{ left: x, top: y, transform: `translate(${tx}, calc(-100% - 10px))` }}
      role="tooltip"
    >
      {children}
    </div>
  );
}

export function TipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-[#5b6785]">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <b className="tabular-nums text-[#0f1a2e]">{value}</b>
    </div>
  );
}

export function EmptyChart({ height, text = "Chưa có dữ liệu" }: { height: number; text?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-[#dfe5ef] text-xs text-[#a3acc2]" style={{ height }}>
      {text}
    </div>
  );
}