import type { HistoryFilters } from "@/lib/history";

const PARAM: [keyof HistoryFilters, string][] = [
  ["from", "from"],
  ["to", "to"],
  ["aufnr", "aufnr"],
  ["mahang", "mahang"],
  ["productType", "ptype"],
  ["productMahang", "pcode"],
];

/** Bộ lọc → query string "from=..&to=..&ptype=.." (bỏ ô trống, có thể bỏ bớt khóa) */
export function filtersToQuery(f: HistoryFilters, omit: (keyof HistoryFilters)[] = []): string {
  const p = new URLSearchParams();
  for (const [k, name] of PARAM) {
    if (!omit.includes(k) && f[k]) p.set(name, f[k]);
  }
  return p.toString();
}

/** Link tới trang chi tiết 1 AUFNR, giữ nguyên bộ lọc để quay lại */
export function detailHref(aufnr: string, query: string, all = false): string {
  const q = all ? (query ? `${query}&scope=all` : "scope=all") : query;
  return `/statistics/${encodeURIComponent(aufnr)}${q ? `?${q}` : ""}`;
}

/** "2026-11-03 14:05:09" -> "03/11/2026 14:05:09" (không đổi múi giờ) */
export function formatDateTime(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}` : s;
}