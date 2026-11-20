"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";

interface YearPickerProps {
  /** 오래된 → 최신 순 */
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
  className?: string;
}

const PILL =
  "inline-flex min-h-11 min-w-20 items-center justify-center rounded-full px-5 text-sm font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";
// 고른 연도: 라이트는 검은 바탕 · 흰 글자, 다크는 반대 (ink ↔ surface)
const SELECTED = "border border-ink bg-ink text-surface";
const UNSELECTED =
  "border border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink";

/**
 * 과거 스터디 연도 고르기 (Past Studies 제목 줄 오른쪽).
 * - 접힘: 선택된 연도 하나 + "···" 버튼
 * - "···" 를 누르면 모든 연도(오래된 → 최신)가 펼쳐지고, 연도를 골라도 펼친 채로 남는다.
 *   "···" 를 다시 누르면 접힌다.
 * 연도가 하나뿐이면 "···" 없이 그 연도만 보인다.
 */
export default function YearPicker({ years, selectedYear, onSelect, className }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const canExpand = years.length > 1;

  return (
    <div
      role="group"
      aria-label="연도 선택"
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
    >
      {open ? (
        // 펼침: 모든 연도. 고른 연도는 검게, 나머지는 눌러서 바꾼다
        <div id={listId} className="flex flex-wrap items-center justify-end gap-2">
          {years.map((year, index) => {
            const selected = year === selectedYear;
            return (
              <button
                key={year}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(year)}
                style={{ animationDelay: `${index * 40}ms` }}
                className={cn(PILL, selected ? SELECTED : UNSELECTED, "motion-safe:animate-pop-in")}
              >
                {year}
              </button>
            );
          })}
        </div>
      ) : (
        // 접힘: 고른 연도만
        <span aria-current="true" className={cn(PILL, SELECTED)}>
          {selectedYear}
        </span>
      )}

      {canExpand && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={open ? "연도 목록 접기" : "다른 연도 보기"}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
            open
              ? "border-ink bg-ink text-surface"
              : "border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
          )}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      )}
    </div>
  );
}
