"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GNB_ITEMS } from "@/constants/routes";
import { cn } from "@/lib/cn";

interface NavLinksProps {
  orientation: "horizontal" | "vertical";
  /** 메뉴 선택 시 호출 — 모바일 메뉴를 닫는 데 쓴다 */
  onNavigate?: () => void;
  className?: string;
}

/**
 * GNB 링크 목록 (IA 3-2). 현재 경로만 읽으면 되므로 이 컴포넌트만 클라이언트다.
 * 활성 기준은 경로 일치 — 쿼리(?project=, ?pastYear=)는 보지 않는다.
 */
export default function NavLinks({ orientation, onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        "flex",
        orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-2",
        className,
      )}
    >
      {GNB_ITEMS.map(({ label, href }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center rounded-full font-medium transition-colors",
                orientation === "horizontal" ? "px-4 text-sm" : "px-2 text-2xl",
                isActive ? "text-brand-blue" : "text-ink hover:text-brand-blue",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
