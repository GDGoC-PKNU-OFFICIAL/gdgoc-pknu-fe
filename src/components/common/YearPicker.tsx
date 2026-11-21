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
 * 과거 스터디 · 과거 프로젝트 연도 고르기 (섹션 제목 줄 오른쪽).
 * - 접힘: 선택된 연도 하나 + "···" 버튼
 * - "···" 를 누르면 모든 연도(오래된 → 최신)가 펼쳐지고, 연도를 골라도 펼친 채로 남는다.
 *   "···" 를 다시 누르면 접힌다.
 * 연도가 하나뿐이면 "···" 없이 그 연도만 보인다.
 *
 * 모바일(< 768px)은 펼친 버튼 줄이 화면을 넘쳐 불편하므로, 같은 자리에 검은 알약 모양의
 * 네이티브 <select> 를 둔다 — 누르면 OS 기본 선택 화면(휠 · 목록)이 떠 엄지로 고르기 쉽다. 목록은 최신 연도부터.
 */
export default function YearPicker({ years, selectedYear, onSelect, className }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const canExpand = years.length > 1;
  const selectId = useId();

  return (
    <>
      {/* 모바일: 네이티브 선택 상자 */}
      <div className="relative shrink-0 md:hidden">
        <label htmlFor={selectId} className="sr-only">
          연도 선택
        </label>
        <select
          id={selectId}
          value={selectedYear}
          onChange={(event) => onSelect(Number(event.target.value))}
          className="min-h-11 appearance-none rounded-full bg-ink py-2 pr-10 pl-5 text-sm font-semibold text-surface tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          {[...years].reverse().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {/* 펼침 화살표 (select 기본 화살표는 appearance-none 으로 숨겼다) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-surface"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* 태블릿 · 데스크톱: 선택 연도 + "···" 펼치기 */}
      <div
        role="group"
        aria-label="연도 선택"
        className={cn("hidden flex-wrap items-center justify-end gap-2 md:flex", className)}
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
                  className={cn(
                    PILL,
                    selected ? SELECTED : UNSELECTED,
                    "motion-safe:animate-pop-in",
                  )}
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
    </>
  );
}
