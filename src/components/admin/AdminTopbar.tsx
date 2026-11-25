"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_EDIT_SEGMENT, ADMIN_NAV_GROUPS, ADMIN_ROUTES } from "@/constants/routes";

/** 지금 경로 → [묶음, 메뉴, 하위 화면] */
function crumbsOf(pathname: string): { label: string; href?: string }[] {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      const match = item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (!match) continue;
      const crumbs: { label: string; href?: string }[] = [
        { label: group.label },
        { label: item.label, href: item.href },
      ];
      if (pathname.endsWith("/new")) crumbs.push({ label: "새로 등록" });
      else if (pathname.endsWith(`/${ADMIN_EDIT_SEGMENT}`)) crumbs.push({ label: "수정" });
      return crumbs;
    }
  }
  return [{ label: "관리자", href: ADMIN_ROUTES.dashboard }];
}

/**
 * 관리자 본문 위 가는 띠 — 지금 위치(묶음 › 메뉴 › 화면)를 업무용 화면처럼 경로로 보여 준다.
 * 모바일은 사이드바 상단 바가 그 역할을 해서 숨긴다.
 */
export default function AdminTopbar() {
  const crumbs = crumbsOf(usePathname());
  return (
    <div className="sticky top-0 z-20 hidden h-12 items-center border-b border-line bg-surface px-6 md:flex">
      <nav aria-label="현재 위치">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-ink-muted">
                    ›
                  </span>
                )}
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="text-ink-muted hover:text-ink hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={last ? "page" : undefined}
                    className={last ? "font-semibold text-ink" : "text-ink-muted"}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
