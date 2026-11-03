"use client";

const nf = new Intl.NumberFormat("vi-VN");
export const PAGE_SIZES = [10, 20, 50, 100];

/** Danh sách nút trang dạng 1 … 4 5 6 … 20 */
function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => keep.add(n));
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

const Chevron = ({ dir, double = false }: { dir: "left" | "right"; double?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {dir === "left" ? (
      <>
        <path d="M15 6l-6 6 6 6" />
        {double && <path d="M20 6l-6 6 6 6" />}
      </>
    ) : (
      <>
        <path d="M9 6l6 6-6 6" />
        {double && <path d="M4 6l6 6-6 6" />}
      </>
    )}
  </svg>
);

type Props = {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  /** Đơn vị đếm, vd "mã", "lần khắc" */
  unit: string;
};

/** Thanh phân trang dùng chung cho các bảng */
export default function Pagination({ total, page, pageSize, onPage, onPageSize, unit }: Props) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const btn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-semibold tabular-nums transition disabled:pointer-events-none disabled:opacity-35";
  const ghost = `${btn} text-[#5b6785] hover:bg-[#eef2f9]`;

  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-col gap-3 border-t border-[#edf1f7] bg-[#fafbfe]/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div className="flex items-center gap-3 text-xs text-[#5b6785]">
        <span>
          Hiển thị <b className="font-semibold tabular-nums text-[#0f1a2e]">{nf.format(start + 1)}</b>–
          <b className="font-semibold tabular-nums text-[#0f1a2e]">{nf.format(end)}</b> trên{" "}
          <b className="font-semibold tabular-nums text-[#0f1a2e]">{nf.format(total)}</b> {unit}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="hidden sm:inline">· Mỗi trang</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded-md border border-[#d9e0ec] bg-white px-1.5 text-xs font-semibold text-[#0f1a2e] outline-none focus:border-[#2f5bea]"
            aria-label="Số dòng mỗi trang"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1 self-center sm:self-auto">
          <button type="button" onClick={() => onPage(1)} disabled={page === 1} className={`${ghost} hidden sm:flex`} aria-label="Trang đầu">
            <Chevron dir="left" double />
          </button>
          <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} className={ghost} aria-label="Trang trước">
            <Chevron dir="left" />
          </button>
          {pageItems(page, pages).map((it, i) =>
            it === "…" ? (
              <span key={`gap-${i}`} className="w-6 text-center text-[13px] text-[#a3acc2]" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={it}
                type="button"
                onClick={() => onPage(it)}
                aria-current={it === page ? "page" : undefined}
                aria-label={`Trang ${it}`}
                className={`${btn} ${it === page ? "bg-[#1d3f8f] text-white shadow-sm" : "text-[#3d4a66] hover:bg-[#eef2f9]"}`}
              >
                {it}
              </button>
            ),
          )}
          <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages} className={ghost} aria-label="Trang sau">
            <Chevron dir="right" />
          </button>
          <button type="button" onClick={() => onPage(pages)} disabled={page === pages} className={`${ghost} hidden sm:flex`} aria-label="Trang cuối">
            <Chevron dir="right" double />
          </button>
        </div>
      )}
    </nav>
  );
}

/** Hook nhỏ: tính trang hiện tại + cắt dữ liệu */
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * pageSize;
  return { current, start, pages, slice: rows.slice(start, start + pageSize) };
}