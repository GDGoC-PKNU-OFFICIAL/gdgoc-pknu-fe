"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface YearButtonsProps {
  years: number[];
  selectedYear: number;
  onSelect?: (year: number) => void;
}

/**
 * 연도 버튼 줄 (IA 5-4) — 과거 프로젝트 · 과거 스터디. 가운데 정렬, 오래된 → 최신.
 * 한 줄을 넘으면 버튼 줄도 가로 스크롤하고, 선택된 버튼이 보이도록 줄 안에서만 스크롤한다.
 */
export default function YearButtons({ years, selectedYear, onSelect }: YearButtonsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const selected = scroller?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!scroller || !selected) return;
    // scrollIntoView 는 페이지까지 세로로 움직일 수 있어 쓰지 않는다 — 줄 안에서만 가운데로 맞춘다
    scroller.scrollLeft = selected.offsetLeft - (scroller.clientWidth - selected.offsetWidth) / 2;
  }, [selectedYear]);

  return (
    <div
      ref={scrollerRef}
      className="relative scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      {/* w-max + mx-auto: 넘치지 않으면 가운데, 넘치면 왼쪽부터 스크롤 (justify-center 는 왼쪽이 잘린다) */}
      <div role="group" aria-label="연도 선택" className="mx-auto flex w-max gap-2 p-1">
        {years.map((year) => {
          const isSelected = year === selectedYear;
          return (
            <button
              key={year}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect?.(year)}
              className={cn(
                "min-h-11 min-w-20 rounded-full px-5 text-sm font-semibold tabular-nums transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                isSelected
                  ? "bg-brand-blue text-white"
                  : "border border-line bg-surface text-ink-muted hover:bg-surface-muted",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
