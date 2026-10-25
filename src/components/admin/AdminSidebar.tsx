"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { clearAllDrafts } from "@/components/admin/lib/draft-storage";
import { leavePage } from "@/components/admin/lib/leave-page";
import { ADMIN_NAV_ITEMS, ADMIN_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";

const MENU_ID = "admin-nav";

/**
 * 관리자 사이드바 (IA 8-1). 데스크톱(≥ 768px)은 좌측 고정, 모바일은 상단 바 + 햄버거로 접힌다.
 * 모바일 메뉴는 공개 MobileNav 와 달리 전체 화면 <dialog> 가 아니라 상단 바 아래로 펼치는 disclosure 다 —
 * 관리자는 데스크톱 우선이고(PRD 4-1), 메뉴가 짧아 화면을 덮을 필요가 없다.
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
    <aside className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <Link href={ADMIN_ROUTES.dashboard} className="text-base font-bold tracking-tight">
          GDGoC Admin
        </Link>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-surface-muted md:hidden"
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
          "flex-1 flex-col justify-between gap-6 px-3 pb-4 md:flex",
          menuOpen ? "flex" : "hidden",
        )}
      >
        <nav aria-label="관리자 메뉴">
          <ul className="flex flex-col gap-1">
            {ADMIN_NAV_ITEMS.map(({ label, href, exact }) => {
              const isActive = pathname === href || (!exact && pathname.startsWith(`${href}/`));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "text-ink hover:bg-surface-muted",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-1 border-t border-line pt-4">
          <a
            href={PUBLIC_ROUTES.home}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            사이트 보기 <span aria-hidden="true">↗</span>
            <span className="sr-only">(새 탭)</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 items-center rounded-lg px-3 text-left text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
          >
            {loggingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
      </div>
    </aside>
  );
}
