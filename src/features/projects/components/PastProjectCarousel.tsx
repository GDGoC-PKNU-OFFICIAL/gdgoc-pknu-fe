"use client";

import { type ReactNode, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import CardPager from "@/components/common/CardPager";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import YearPicker from "@/components/common/YearPicker";
import { trackEvent } from "@/lib/analytics";

import { resolveSelectedYear, type YearGroup } from "../lib/group-by-year";
import { PAST_YEAR_QUERY, replaceUrl, urlWithQuery } from "../lib/project-query";

/** 과거 프로젝트 한 쪽의 카드 수 (진행 중 프로젝트와 같은 3 × 2줄) */
const PAST_PAGE_SIZE = 6;

interface PastProjectCarouselProps {
  /** 연도별 카드. 오래된 → 최신 순 (group-by-year.ts). 카드는 서버에서 그린 ProjectCard 다 */
  groups: YearGroup<ReactNode>[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
  /** 섹션 제목 — 같은 줄 오른쪽에 연도 고르기가 붙는다 */
  title: string;
  /** 제목 요소 id (section 의 aria-labelledby 대상) */
  titleId: string;
}

/**
 * 과거 프로젝트 연도 캐러셀 (C-04, PRD 3-3-A). ?pastYear= 쿼리와 동기화한다.
 *
 * useSearchParams 를 쓰는 컴포넌트는 정적 빌드 때 HTML 에 들어가지 않고 브라우저에서만 그려진다.
 * 그래서 page.tsx 는 이 컴포넌트를 Suspense 로 감싸고, fallback 에 PastProjectCarouselView(최신 연도)를
 * 넣는다 → 과거 프로젝트 카드가 초기 HTML 에 포함된다 (SEO · 첫 화면).
 */
export default function PastProjectCarousel({
  groups,
  emptyMessage,
  title,
  titleId,
}: PastProjectCarouselProps) {
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
    // 연도 변경은 히스토리를 쌓지 않는다 (IA 6-3). 카드는 CardPager 의 key 가 바뀌며 첫 쪽으로 간다
    replaceUrl(urlWithQuery({ [PAST_YEAR_QUERY]: String(year) }));
    trackEvent("year_select", { section: "past_projects", year });
  };

  return (
    <PastProjectCarouselView
      groups={groups}
      selectedYear={selectedYear}
      onSelectYear={selectYear}
      emptyMessage={emptyMessage}
      title={title}
      titleId={titleId}
    />
  );
}

interface PastProjectCarouselViewProps extends PastProjectCarouselProps {
  selectedYear: number | null;
  /** 없으면 버튼이 동작하지 않는다 (서버 HTML 용 fallback) */
  onSelectYear?: (year: number) => void;
}

/** 서버 HTML(fallback)에서는 연도를 바꿀 수 없다 */
const noop = () => {};

/**
 * URL 을 모르는 표시 전용 버전. Suspense fallback(서버 HTML)으로도 쓴다.
 * 제목 줄: 왼쪽 제목, 같은 높이 오른쪽에 연도 고르기 — /studies 의 Past Studies 와 같은 모양 (YearPicker).
 */
export function PastProjectCarouselView({
  groups,
  selectedYear,
  onSelectYear = noop,
  emptyMessage,
  title,
  titleId,
}: PastProjectCarouselViewProps) {
  const selectedGroup = groups.find((group) => group.year === selectedYear);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <SectionHeader title={title} titleId={titleId} variant="home" />
        {/* 데이터가 없으면 연도 고르기를 숨기고 안내 문구만 (PRD 3-3-A 빈 상태) */}
        {selectedGroup && (
          <YearPicker
            years={groups.map((group) => group.year)}
            selectedYear={selectedGroup.year}
            onSelect={onSelectYear}
            className="ml-auto"
          />
        )}
      </div>
      {selectedGroup ? (
        // 진행 중 프로젝트처럼 한 쪽에 6개(데스크톱 3 × 2줄). 6개를 넘으면 다음 쪽으로 넘어간다
        <CardPager
          key={selectedGroup.year}
          label={`${selectedGroup.year}년 과거 프로젝트`}
          pageSize={PAST_PAGE_SIZE}
        >
          {selectedGroup.items}
        </CardPager>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </>
  );
}
