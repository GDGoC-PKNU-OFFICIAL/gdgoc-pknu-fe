"use client";

import { cn } from "@/lib/cn";

/** 현재 페이지 앞뒤로 보여 줄 번호 수 */
const SIBLINGS = 2;

interface PaginationProps {
  /** 0부터 시작 (명세 3-7). 화면에는 page + 1 */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** 0-based 페이지 번호 목록 — 현재 페이지 앞뒤 SIBLINGS 개 */
function visiblePages(page: number, totalPages: number): number[] {
  const start = Math.max(0, Math.min(page - SIBLINGS, totalPages - 1 - SIBLINGS * 2));
  const end = Math.min(totalPages - 1, start + SIBLINGS * 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const ITEM_CLASS =
  "flex min-w-11 h-11 items-center justify-center rounded-full px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40";

/** 관리자 목록 페이지 이동 (IA 8-3 "[‹ 1 2 3 ›]"). 1페이지뿐이면 그리지 않는다 */
export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="페이지" className="flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={page <= 0}
            onClick={() => onChange(page - 1)}
            className={cn(ITEM_CLASS, "hover:bg-surface")}
          >
            ‹
          </button>
        </li>
        {visiblePages(page, totalPages).map((p) => (
          <li key={p}>
            <button
              type="button"
              aria-label={`${p + 1}페이지`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={cn(
                ITEM_CLASS,
                p === page ? "bg-brand-blue font-semibold text-white" : "hover:bg-surface",
              )}
            >
              {p + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={page >= totalPages - 1}
            onClick={() => onChange(page + 1)}
            className={cn(ITEM_CLASS, "hover:bg-surface")}
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}
