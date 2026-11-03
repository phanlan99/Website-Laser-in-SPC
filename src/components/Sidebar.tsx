"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { appFont } from "../lib/fonts";

/* ------------------------------------------------------------------ */
/*  Nền đồng bộ với BackgroundLaser: xanh than tối, quầng sáng xanh,   */
/*  lưới kỹ thuật mờ 48px và điểm nhấn màu đồng                        */
/* ------------------------------------------------------------------ */
const GRID =
  "linear-gradient(rgba(150,172,220,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(150,172,220,.045) 1px, transparent 1px)";

const SURFACE: CSSProperties = {
  backgroundColor: "#0a1020",
  backgroundImage: `radial-gradient(140% 55% at 50% 0%, rgba(92,128,210,.24) 0%, rgba(52,76,140,.08) 45%, transparent 75%), ${GRID}, linear-gradient(180deg, #111a2e 0%, #0a1020 55%, #070b16 100%)`,
  backgroundSize: "auto, 48px 48px, 48px 48px, auto",
};

const HEADER_SURFACE: CSSProperties = {
  backgroundColor: "#0a1020",
  backgroundImage:
    "radial-gradient(70% 160% at 50% 0%, rgba(92,128,210,.22) 0%, transparent 70%), linear-gradient(180deg, #111a2e 0%, #0a1020 100%)",
};

/* ------------------------------------------------------------------ */
/*  Icon SVG                                                           */
/* ------------------------------------------------------------------ */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const HomeIcon = () => (
  <svg {...iconProps}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
);

const ChartIcon = () => (
  <svg {...iconProps}>
    <path d="M3 21h18" />
    <path d="M6 17V11" />
    <path d="M11 17V6" />
    <path d="M16 17v-4" />
    <path d="M20 17V8" />
  </svg>
);

const ErrorListIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2v.1" />
  </svg>
);

const MenuIcon = () => (
  <svg {...iconProps} width={22} height={22}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = () => (
  <svg {...iconProps} width={20} height={20}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg {...iconProps} width={16} height={16} strokeWidth={2}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const LogoMark = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
    <rect x="2" y="2" width="44" height="44" rx="6" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="0.75" opacity=".6" />
    <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="2.4" fill="#ffb066" />
    <path d="M24 10v6M24 32v6M10 24h6M32 24h6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Danh mục                                                           */
/* ------------------------------------------------------------------ */
export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/", icon: <HomeIcon /> },
  { label: "Thống kê", href: "/statistics", icon: <ChartIcon /> },
  { label: "Danh sách lỗi", href: "/errors", icon: <ErrorListIcon /> },
];

/* ------------------------------------------------------------------ */
/*  Lưu trạng thái thu gọn (giữ nguyên khi chuyển trang / tải lại)     */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "lm-sidebar-collapsed";
const CHANGE_EVENT = "lm-sidebar-collapsed-change";
let collapsedCache: boolean | null = null;

function getCollapsed(): boolean {
  if (collapsedCache === null) {
    try {
      collapsedCache = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      collapsedCache = false;
    }
  }
  return collapsedCache;
}

function setCollapsed(value: boolean) {
  collapsedCache = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* trình duyệt chặn storage: vẫn hoạt động trong phiên hiện tại */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribeCollapsed(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      collapsedCache = null;
      callback();
    }
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/* ------------------------------------------------------------------ */
/*  Các khối dùng chung                                                */
/* ------------------------------------------------------------------ */
/** Viền sáng màu đồng ở mép phải – giống đường kẻ dưới tiêu đề nền */
const EdgeGlow = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d6b880]/55 to-transparent"
  />
);

function Ornament() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d6b880]/70" />
      <span className="h-1.5 w-1.5 rotate-45 border border-[#d6b880]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d6b880]/70" />
    </div>
  );
}

function Logo({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  return (
    <div className={compact ? "px-3 pb-5 pt-8" : "px-6 pb-6 pt-9"}>
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="Laser Marking – Trang chủ"
        className="group flex flex-col items-center gap-3 rounded-lg text-center text-[#d6b880] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6b880]"
      >
        <span className="drop-shadow-[0_0_12px_rgba(214,184,128,0.35)]">
          <LogoMark size={compact ? 38 : 48} />
        </span>
        {!compact && (
          <span className="whitespace-nowrap text-xl font-semibold tracking-[0.01em] text-[#e6ebf5] transition-colors group-hover:text-white">
            Laser Marking
          </span>
        )}
      </Link>
      <div className={compact ? "mt-5" : "mt-6"}>
        <Ornament />
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
  compact,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  compact: boolean;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className={`flex-1 ${compact ? "overflow-visible px-3" : "overflow-y-auto px-4"}`}>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center rounded-lg py-2.5 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#d6b880] ${
                  compact ? "justify-center px-0" : "gap-3 px-3.5"
                } ${
                  active
                    ? "bg-[#5c80d2]/15 text-[#f6e4b8] ring-1 ring-inset ring-[#d6b880]/25 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-[#d6b880] before:shadow-[0_0_10px_rgba(214,184,128,0.8)]"
                    : "text-[#aab4c8] hover:bg-white/[0.05] hover:text-[#e6ebf5]"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    active ? "text-[#d6b880]" : "text-[#7d89a3] group-hover:text-[#e6ebf5]"
                  }`}
                >
                  {item.icon}
                </span>

                <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>

                {compact && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-full top-1/2 z-30 ml-4 -translate-y-1/2 whitespace-nowrap rounded-md border border-[#d6b880]/30 bg-[#0f172b] px-2.5 py-1 text-[13px] font-medium text-[#e6ebf5] opacity-0 shadow-lg shadow-black/40 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */
type SidebarProps = {
  /** Ghi đè danh mục nếu một page cần menu riêng */
  items?: NavItem[];
};

export default function Sidebar({ items = NAV_ITEMS }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, () => false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const year = useSyncExternalStore(noopSubscribe, () => new Date().getFullYear(), () => null);

  const closeMobile = () => setMobileOpen(false);

  // Menu mobile đang mở: khóa cuộn, Esc để đóng, tự đóng khi lên desktop
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ================= DESKTOP: sidebar thu gọn / mở rộng ================= */}
      <aside
        aria-label="Điều hướng chính"
        style={SURFACE}
        className={`${appFont.className} relative hidden shrink-0 flex-col text-[#e6ebf5] shadow-[8px_0_32px_rgba(0,0,0,0.35)] transition-[width] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-20 lg:flex lg:h-screen ${
          collapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <EdgeGlow />

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
          className="absolute -right-4 top-24 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#d6b880]/60 bg-[#0f172b] text-[#d6b880] shadow-md shadow-black/40 transition-colors hover:bg-[#16213a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6b880]"
        >
          <span className={`transition-transform duration-300 motion-reduce:transition-none ${collapsed ? "rotate-180" : ""}`}>
            <ChevronLeftIcon />
          </span>
        </button>

        <Logo compact={collapsed} />
        <NavList items={items} pathname={pathname} compact={collapsed} />

        <div className="whitespace-nowrap border-t border-white/[0.06] py-5 text-center text-xs text-[#7d89a3]">
          {collapsed ? `© ${year}` : `© ${year} Laser Marking`}
        </div>
      </aside>

      {/* ================= MOBILE: thanh trên cùng ================= */}
      <header
        style={HEADER_SURFACE}
        className={`${appFont.className} sticky top-0 z-30 flex items-center justify-between border-b border-[#d6b880]/20 px-4 py-3 text-[#e6ebf5] lg:hidden`}
      >
        <Link href="/" className="flex items-center gap-2.5 text-[#d6b880]">
          <LogoMark size={30} />
          <span className="text-lg font-semibold text-[#e6ebf5]">Laser Marking</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="rounded-lg border border-[#d6b880]/40 p-1.5 text-[#d6b880] transition-colors hover:bg-[#d6b880]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6b880]"
        >
          <MenuIcon />
        </button>
      </header>

      {/* ================= MOBILE: ngăn kéo menu (portal vào <body>) ================= */}
      {mounted &&
        createPortal(
          <div className={`${appFont.className} lg:hidden`}>
            <div
              onClick={closeMobile}
              aria-hidden
              className={`fixed inset-0 z-[90] bg-[#04060b]/70 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
                mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            <aside
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Menu điều hướng"
              inert={!mobileOpen}
              style={{ ...SURFACE, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
              className="fixed inset-y-0 left-0 z-[100] flex h-dvh w-72 max-w-[85vw] flex-col text-[#e6ebf5] shadow-2xl shadow-black/60 transition-transform duration-300 ease-out motion-reduce:transition-none"
            >
              <EdgeGlow />
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Đóng menu"
                className="absolute right-3 top-3 rounded-md p-1 text-[#7d89a3] transition-colors hover:text-[#e6ebf5] focus-visible:outline-2 focus-visible:outline-[#d6b880]"
              >
                <CloseIcon />
              </button>

              <Logo compact={false} onNavigate={closeMobile} />
              <NavList items={items} pathname={pathname} compact={false} onNavigate={closeMobile} />

              <div className="border-t border-white/[0.06] px-6 py-5 text-center text-xs text-[#7d89a3]">
                © {year} Laser Marking
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}