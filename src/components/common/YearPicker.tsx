"use client";

import { cn } from "@/lib/cn";

interface YearPickerProps {
  /** 오래된 → 최신 순 */
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
  className?: string;
}

/**
 * 과거 스터디 · 과거 프로젝트 연도 고르기 (섹션 제목 줄 오른쪽).
 *   ‹  2025  ›
 * 왼쪽 화살표 = 한 해 전, 오른쪽 = 한 해 뒤. 맨 끝 연도에서는 그쪽 화살표가 흐려지고 눌리지 않는다.
 * 연도가 하나뿐이면 화살표 없이 연도만 보인다. 모바일 · 데스크톱 모두 같은 모양.
 */
export default function YearPicker({ years, selectedYear, onSelect, className }: YearPickerProps) {
  const index = years.indexOf(selectedYear);
  const prevYear = index > 0 ? years[index - 1] : undefined;
  const nextYear = index >= 0 && index < years.length - 1 ? years[index + 1] : undefined;
  const canMove = years.length > 1;

  return (
    <div
      role="group"
      aria-label="연도 선택"
      className={cn("flex shrink-0 items-center", className)}
    >
      {canMove && (
        <ArrowButton
          direction="prev"
          year={prevYear}
          onClick={() => prevYear !== undefined && onSelect(prevYear)}
        />
      )}
      {/* 화살표로 바뀔 때 스크린리더가 새 연도를 읽어 준다 */}
      <span
        aria-live="polite"
        className="min-w-14 text-center text-lg font-semibold text-ink tabular-nums"
      >
        {selectedYear}
      </span>
      {canMove && (
        <ArrowButton
          direction="next"
          year={nextYear}
          onClick={() => nextYear !== undefined && onSelect(nextYear)}
        />
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  year,
  onClick,
}: {
  direction: "prev" | "next";
  /** 눌렀을 때 갈 연도. 없으면 맨 끝이라 비활성 */
  year: number | undefined;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      disabled={year === undefined}
      onClick={onClick}
      aria-label={year === undefined ? (isPrev ? "이전 연도 없음" : "다음 연도 없음") : `${year}년 보기`}
      className="flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:pointer-events-none disabled:opacity-25"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
