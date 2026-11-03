"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = { from: string; to: string };

function toYMD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toYMD(d);
}

const PRESETS: { label: string; range: () => [string, string] }[] = [
  { label: "Hôm nay", range: () => [daysAgo(0), daysAgo(0)] },
  { label: "7 ngày", range: () => [daysAgo(6), daysAgo(0)] },
  { label: "30 ngày", range: () => [daysAgo(29), daysAgo(0)] },
  {
    label: "Tháng này",
    range: () => {
      const now = new Date();
      return [toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), toYMD(now)];
    },
  },
];

const inputCls =
  "h-10 w-full rounded-lg border border-[#d9e0ec] bg-white px-3 text-sm text-[#0f1a2e] outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10";

/** Bộ lọc khoảng thời gian – đẩy from/to lên URL để Server Component tải lại dữ liệu */
export default function DateRangeFilter({ from, to }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);
  const [pending, startTransition] = useTransition();

  const apply = (f: string, t: string) => {
    if (!f || !t) return;
    const [a, b] = f <= t ? [f, t] : [t, f];
    setFromVal(a);
    setToVal(b);
    startTransition(() => router.push(`${pathname}?from=${a}&to=${b}`));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(fromVal, toVal);
      }}
      className="flex flex-col gap-3 rounded-2xl border border-[#e3e8f2] bg-white/80 p-3 shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-12px_rgba(16,24,40,.14)] backdrop-blur-md md:flex-row md:items-end"
    >
      {/* Chọn nhanh */}
      <div className="flex shrink-0 rounded-lg bg-[#eef2f9] p-1" role="group" aria-label="Chọn nhanh khoảng thời gian">
        {PRESETS.map((p) => {
          const [f, t] = p.range();
          const active = f === from && t === to;
          return (
            <button
              key={p.label}
              type="button"
              disabled={pending}
              onClick={() => apply(f, t)}
              aria-pressed={active}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition md:flex-none ${
                active ? "bg-white text-[#1d3f8f] shadow-sm" : "text-[#5b6785] hover:text-[#0f1a2e]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 md:flex md:flex-none md:items-end">
        <label className="block md:w-40">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8a94ad]">Từ ngày</span>
          <input type="date" value={fromVal} max={toVal} onChange={(e) => setFromVal(e.target.value)} className={inputCls} required />
        </label>
        <label className="block md:w-40">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8a94ad]">Đến ngày</span>
          <input type="date" value={toVal} min={fromVal} onChange={(e) => setToVal(e.target.value)} className={inputCls} required />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1d3f8f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f5bea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea] disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        )}
        {pending ? "Đang tải…" : "Tìm kiếm"}
      </button>
    </form>
  );
}