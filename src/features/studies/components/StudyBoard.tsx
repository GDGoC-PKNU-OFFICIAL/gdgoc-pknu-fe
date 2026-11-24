"use client";

import { useState } from "react";

import CardPager from "@/components/common/CardPager";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import YearPicker from "@/components/common/YearPicker";
import { trackEvent } from "@/lib/analytics";
import { parseYearMonth } from "@/lib/date";
import { groupByYear, latestYear } from "@/lib/group-by-year";
import type { Study } from "@/types/api";

import { sortByLatest } from "../lib/study-sort";

import StudyCard from "./StudyCard";

/** 진행 중 · 과거 스터디 한 쪽의 카드 수 (데스크톱 3 × 2줄) */
const PAGE_SIZE = 6;

const CONTAINER = "mx-auto flex max-w-site flex-col gap-8 px-4 py-16 md:px-8";

interface SectionText {
  title: string;
  empty: string;
}

interface StudyBoardProps {
  current: Study[];
  past: Study[];
  currentText: SectionText;
  pastText: SectionText;
}

/**
 * /studies 본문 (P-03). 진행 중 스터디 그리드(6개 넘으면 쪽 넘기기) + 연도별 과거 스터디 슬라이드.
 *
 * - 정렬: 항상 최신순 (고르는 메뉴 없음).
 * - 과거 스터디: ‹ 연도 › 로 한 해씩 넘기고(기본은 가장 최근 연도), 진행 중 스터디와 같은 2줄 그리드(CardPager).
 *   한 해 스터디가 6개를 넘으면 다음 쪽으로 넘어간다.
 * 서버 HTML 에는 기본 상태(최근 연도)가 그대로 들어간다.
 */
export default function StudyBoard({ current, past, currentText, pastText }: StudyBoardProps) {
  const pastGroups = groupByYear(past, (study) => parseYearMonth(study.period.start).year);
  const [selectedYear, setSelectedYear] = useState<number | null>(() => latestYear(pastGroups));
  const selectedGroup =
    pastGroups.find((group) => group.year === selectedYear) ?? pastGroups.at(-1) ?? null;

  const selectYear = (year: number) => {
    if (year === selectedGroup?.year) return;
    setSelectedYear(year);
    trackEvent("year_select", { section: "past_studies", year });
  };

  return (
    <>
      {/* 진행 중 스터디 */}
      <section aria-labelledby="current-studies-title" className={CONTAINER}>
        {/* 스터디 페이지는 섹션 배지 없이 제목만, 메인 페이지와 같은 제목 글꼴(home)로 둔다 */}
        <SectionHeader title={currentText.title} titleId="current-studies-title" variant="home" />
        {current.length === 0 ? (
          <EmptyState message={currentText.empty} />
        ) : (
          // 한 쪽에 6개(데스크톱 3 × 2줄). 7개부터는 다음 쪽으로 넘어간다
          <CardPager label="진행 중 스터디" pageSize={PAGE_SIZE}>
            {sortByLatest(current).map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </CardPager>
        )}
      </section>

      {/* 과거 스터디 — 연도별 넘기기 */}
      <section aria-labelledby="past-studies-title" className={CONTAINER}>
        {/* 제목 줄: 왼쪽 제목, 같은 높이 오른쪽에 연도 고르기.
            ‹ 연도 › 화살표로 한 해씩 넘긴다 (YearPicker) */}
        <div className="flex items-center justify-between gap-4">
          {/* 스터디 페이지는 섹션 배지 없이 제목만, 메인 페이지와 같은 제목 글꼴(home)로 둔다 */}
          <SectionHeader title={pastText.title} titleId="past-studies-title" variant="home" />
          {selectedGroup !== null && (
            <YearPicker
              years={pastGroups.map((group) => group.year)}
              selectedYear={selectedGroup.year}
              onSelect={selectYear}
              className="ml-auto"
            />
          )}
        </div>
        {selectedGroup === null ? (
          <EmptyState message={pastText.empty} />
        ) : (
          // 진행 중 스터디처럼 한 쪽에 6개(데스크톱 3 × 2줄). 연도가 바뀌면 key 가 바뀌어 첫 쪽으로 간다
          <CardPager
            key={selectedGroup.year}
            label={`${selectedGroup.year}년 과거 스터디 (${selectedGroup.items.length}개)`}
            pageSize={PAGE_SIZE}
          >
            {sortByLatest(selectedGroup.items).map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </CardPager>
        )}
      </section>
    </>
  );
}
