"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import CardSlider from "@/components/common/CardSlider";
import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/lib/cn";

import { resolveSelectedYear, type YearGroup } from "../lib/group-by-year";
import { PAST_YEAR_QUERY, replaceUrl, urlWithQuery } from "../lib/project-query";

interface PastProjectCarouselProps {
  /** 연도별 카드. 오래된 → 최신 순 (group-by-year.ts). 카드는 서버에서 그린 ProjectCard 다 */
  groups: YearGroup<ReactNode>[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/**
 * 과거 프로젝트 연도 캐러셀 (C-04, PRD 3-3-A). ?pastYear= 쿼리와 동기화한다.
 *
 * useSearchParams 를 쓰는 컴포넌트는 정적 빌드 때 HTML 에 들어가지 않고 브라우저에서만 그려진다.
 * 그래서 page.tsx 는 이 컴포넌트를 Suspense 로 감싸고, fallback 에 PastProjectCarouselView(최신 연도)를
 * 넣는다 → 과거 프로젝트 카드가 초기 HTML 에 포함된다 (SEO · 첫 화면).
 */
export default function PastProjectCarousel({ groups, emptyMessage }: PastProjectCarouselProps) {
  const pastYearParam = useSearchParams().get(PAST_YEAR_QUERY);
  const selectedYear = resolveSelectedYear(groups, pastYearParam);

  // 숫자가 아니거나 데이터가 없는 연도 → 쿼리를 지워 최신 연도로 교정한다 (IA 6-1, replace)
  useEffect(() => {
    if (pastYearParam !== null && String(selectedYear) !== pastYearParam) {
      replaceUrl(urlWithQuery({ [PAST_YEAR_QUERY]: null }));
    }
  }, [pastYearParam, selectedYear]);

  const selectYear = (year: number) => {
    if (year === selectedYear) return;
    // 연도 변경은 히스토리를 쌓지 않는다 (IA 6-3). 슬라이드는 CardSlider 의 key 가 바뀌며 맨 앞으로 간다
    replaceUrl(urlWithQuery({ [PAST_YEAR_QUERY]: String(year) }));
  };

  return (
    <PastProjectCarouselView
      groups={groups}
      selectedYear={selectedYear}
      onSelectYear={selectYear}
      emptyMessage={emptyMessage}
    />
  );
}

interface PastProjectCarouselViewProps extends PastProjectCarouselProps {
  selectedYear: number | null;
  /** 없으면 버튼이 동작하지 않는다 (서버 HTML 용 fallback) */
  onSelectYear?: (year: number) => void;
}

/** URL 을 모르는 표시 전용 버전. Suspense fallback(서버 HTML)으로도 쓴다 */
export function PastProjectCarouselView({
  groups,
  selectedYear,
  onSelectYear,
  emptyMessage,
}: PastProjectCarouselViewProps) {
  const selectedGroup = groups.find((group) => group.year === selectedYear);
  // 데이터가 없으면 연도 버튼을 숨기고 안내 문구만 (PRD 3-3-A 빈 상태)
  if (!selectedGroup) return <EmptyState message={emptyMessage} />;

  return (
    <div className="flex flex-col gap-6">
      <YearButtons
        years={groups.map((group) => group.year)}
        selectedYear={selectedGroup.year}
        onSelect={onSelectYear}
      />
      <CardSlider key={selectedGroup.year} label={`${selectedGroup.year}년 과거 프로젝트`}>
        {selectedGroup.items}
      </CardSlider>
    </div>
  );
}

interface YearButtonsProps {
  years: number[];
  selectedYear: number;
  onSelect?: (year: number) => void;
}

/**
 * 연도 버튼 줄 (IA 5-4). 가운데 정렬, 오래된 → 최신.
 * 한 줄을 넘으면 버튼 줄도 가로 스크롤하고, 선택된 버튼이 보이도록 줄 안에서만 스크롤한다.
 */
function YearButtons({ years, selectedYear, onSelect }: YearButtonsProps) {
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
