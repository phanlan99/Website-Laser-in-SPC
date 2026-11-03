"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import type { MachineOption } from "@/lib/machines";

/** Giá trị bộ lọc trên form (khớp với HistoryFilters ở server) */
export type FilterValues = {
  from: string;
  to: string;
  aufnr: string;
  mahang: string;
  productType: string;
  productMahang: string;
  /** "" | "yes" | "no" */
  errorFilter: string;
  /** Số máy (mamay), "" = tất cả */
  machine: string;
};

type Props = {
  initial: FilterValues;
  productTypes: string[];
  productMahangs: string[];
  machines: MachineOption[];
};

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

/** Tạo URL ?from=&to=&aufnr=&mahang=&ptype=&pcode= (bỏ các ô trống) */
function buildQuery(v: FilterValues): string {
  const p = new URLSearchParams({ from: v.from, to: v.to });
  if (v.aufnr.trim()) p.set("aufnr", v.aufnr.trim());
  if (v.mahang.trim()) p.set("mahang", v.mahang.trim());
  if (v.productType) p.set("ptype", v.productType);
  if (v.productMahang.trim()) p.set("pcode", v.productMahang.trim());
  if (v.machine) p.set("may", v.machine);
  if (v.errorFilter) p.set("err", v.errorFilter);
  return p.toString();
}

const fieldCls =
  "h-10 w-full rounded-lg border border-[#d9e0ec] bg-white px-3 text-sm text-[#0f1a2e] outline-none transition placeholder:text-[#a3acc2] focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10";
const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8a94ad]";

/**
 * Bộ lọc trang thống kê: khoảng thời gian + AUFNR, Mã hàng, Loại hàng, Mã viết tắt.
 * Bấm Tìm kiếm → đẩy lên URL → Server Component truy vấn lại database,
 * nên 4 thẻ số liệu và bảng luôn tính theo đúng bộ lọc.
 */
export default function HistoryFilters({ initial, productTypes, productMahangs, machines }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const [v, setV] = useState<FilterValues>(initial);
  const [pending, startTransition] = useTransition();

  const set = (k: keyof FilterValues) => (e: { target: { value: string } }) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const apply = (next: FilterValues) => {
    if (!next.from || !next.to) return;
    const fixed = next.from <= next.to ? next : { ...next, from: next.to, to: next.from };
    setV(fixed);
    startTransition(() => router.push(`${pathname}?${buildQuery(fixed)}`));
  };

  const hasFieldFilter = Boolean(
    initial.aufnr || initial.mahang || initial.productType || initial.productMahang || initial.errorFilter || initial.machine,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(v);
      }}
      className="rounded-2xl border border-[#e3e8f2] bg-white/80 p-4 shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-12px_rgba(16,24,40,.14)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-4 min-[1900px]:flex-row min-[1900px]:items-end">
        {/* -------- Thời gian -------- */}
        <fieldset className="flex flex-col gap-3 md:flex-row md:items-end">
          <legend className="sr-only">Khoảng thời gian</legend>
          <div className="flex rounded-lg bg-[#eef2f9] p-1" role="group" aria-label="Chọn nhanh khoảng thời gian">
            {PRESETS.map((p) => {
              const [f, t] = p.range();
              const active = f === initial.from && t === initial.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  disabled={pending}
                  aria-pressed={active}
                  onClick={() => apply({ ...v, from: f, to: t })}
                  className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition md:flex-none ${
                    active ? "bg-white text-[#1d3f8f] shadow-sm" : "text-[#5b6785] hover:text-[#0f1a2e]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <label className="block md:w-40">
              <span className={labelCls}>Từ ngày</span>
              <input type="date" value={v.from} max={v.to} onChange={set("from")} className={fieldCls} required />
            </label>
            <label className="block md:w-40">
              <span className={labelCls}>Đến ngày</span>
              <input type="date" value={v.to} min={v.from} onChange={set("to")} className={fieldCls} required />
            </label>
          </div>
        </fieldset>

        <span className="hidden h-12 w-px bg-[#e3e8f2] min-[1900px]:block" aria-hidden />

        {/* -------- Lọc theo mã -------- */}
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-end">
          <fieldset className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <legend className="sr-only">Lọc theo mã</legend>
            <label className="block">
              <span className={labelCls}>AUFNR</span>
              <input value={v.aufnr} onChange={set("aufnr")} placeholder="Nhập AUFNR…" className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Mã hàng</span>
              <input value={v.mahang} onChange={set("mahang")} placeholder="Nhập mã hàng…" className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Loại hàng</span>
              <select value={v.productType} onChange={set("productType")} className={`${fieldCls} pr-8`}>
                <option value="">Tất cả</option>
                {productTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                {/* Giữ giá trị đang lọc dù không còn trong danh sách */}
                {v.productType && !productTypes.includes(v.productType) && (
                  <option value={v.productType}>{v.productType}</option>
                )}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Mã viết tắt</span>
              <input
                value={v.productMahang}
                onChange={set("productMahang")}
                placeholder="Nhập mã viết tắt…"
                list={listId}
                className={fieldCls}
              />
              <datalist id={listId}>
                {productMahangs.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className={labelCls}>Mã máy</span>
              <select value={v.machine} onChange={set("machine")} className={`${fieldCls} pr-8`}>
                <option value="">Tất cả máy</option>
                {machines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Khắc lỗi</span>
              <select
                value={v.errorFilter}
                onChange={set("errorFilter")}
                className={`${fieldCls} pr-8 ${v.errorFilter === "yes" ? "border-[#f3c7c7] bg-[#fff6f5] text-[#b42318]" : ""}`}
              >
                <option value="">Tất cả</option>
                <option value="yes">Chỉ mã có lỗi</option>
                <option value="no">Chỉ mã không lỗi</option>
              </select>
            </label>
          </fieldset>

          <div className="flex gap-2">
            {hasFieldFilter && (
              <button
                type="button"
                disabled={pending}
                onClick={() => apply({ ...v, aufnr: "", mahang: "", productType: "", productMahang: "", errorFilter: "", machine: "" })}
                className="h-10 flex-1 whitespace-nowrap rounded-lg border border-[#d9e0ec] bg-white px-4 text-sm font-semibold text-[#5b6785] transition hover:border-[#c3cbdc] hover:text-[#0f1a2e] lg:flex-none"
              >
                Xóa lọc
              </button>
            )}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#1d3f8f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f5bea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea] disabled:cursor-wait disabled:opacity-70 lg:flex-none"
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
          </div>
        </div>
      </div>
    </form>
  );
}