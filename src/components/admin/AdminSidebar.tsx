"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { clearAllDrafts } from "@/components/admin/lib/draft-storage";
import { leavePage } from "@/components/admin/lib/leave-page";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_ROUTES,
  type AdminNavIcon,
  PUBLIC_ROUTES,
} from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";

const MENU_ID = "admin-nav";

/** 24 × 24 선 아이콘 */
const ICON_PATHS = {
  dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  project: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  study: "M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zm0 0V19",
  event:
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 3v4M16 3v4",
  member:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6m1-9a3 3 0 1 0 0-6m2.5 15c0-2.4-1-4.4-2.5-5.5",
  about: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.01",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
} satisfies Record<AdminNavIcon, string>;

function NavIcon({ icon }: { icon: AdminNavIcon }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[icon]} />
    </svg>
  );
}

/**
 * 관리자 사이드바 (IA 8-1). 업무용 화면(ERP)처럼 어두운 남색 바탕에 메뉴를 묶음별로 나눈다.
 * 데스크톱(≥ 768px)은 좌측 고정, 모바일은 상단 바 + 햄버거로 접힌다 (메뉴가 짧아 화면을 덮지 않는 disclosure).
 * 다크 테마 토큰과 상관없이 늘 같은 어두운 색이라, 글자 · 선 색을 이 안에서 직접 정한다.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      toast.error("로그아웃에 실패했습니다. 다시 시도해 주세요.");
      setLoggingOut(false);
      return;
    }
    // 공용 계정 · 공용 PC 를 고려해 임시 저장본을 모두 지운다 (PRD 4-6)
    clearAllDrafts();
    // 전체 이동 — 클라이언트 라우터에 캐시된 관리자 화면이 뒤로 가기로 다시 보이지 않게 한다
    leavePage(ADMIN_ROUTES.login);
  }

  return (
    <aside className="bg-[#172033] text-[#c9d1e0] md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:shrink-0 md:flex-col">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <Link
          href={ADMIN_ROUTES.dashboard}
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-white"
        >
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded bg-brand-blue text-[11px] font-black"
          >
            G
          </span>
          GDGoC PKNU 관리자
        </Link>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-11 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d={menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>

      <div
        id={MENU_ID}
        className={cn(
          "flex-1 flex-col justify-between gap-6 overflow-y-auto py-3 md:flex",
          menuOpen ? "flex" : "hidden",
        )}
      >
        <nav aria-label="관리자 메뉴" className="flex flex-col gap-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <p className="px-4 pb-1 text-[11px] font-semibold tracking-wider text-[#7d8aa3]">
                {group.label}
              </p>
              <ul className="flex flex-col">
                {group.items.map(({ label, href, exact, icon }) => {
                  const isActive = pathname === href || (!exact && pathname.startsWith(`${href}/`));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "relative flex min-h-10 items-center gap-2.5 px-4 text-sm transition-colors",
                          isActive
                            ? "bg-white/10 font-semibold text-white before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-brand-blue"
                            : "hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <NavIcon icon={icon} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col border-t border-white/10 pt-2">
          <a
            href={PUBLIC_ROUTES.home}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center gap-1 px-4 text-sm transition-colors hover:bg-white/5 hover:text-white"
          >
            사이트 보기 <span aria-hidden="true">↗</span>
            <span className="sr-only">(새 탭)</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-10 items-center px-4 text-left text-sm transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {loggingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
      </div>
    </aside>
  );
}
