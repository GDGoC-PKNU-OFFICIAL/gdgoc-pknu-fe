"use client";

import { useState } from "react";

import CardSlider from "@/components/common/CardSlider";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import YearButtons from "@/components/common/YearButtons";
import { trackEvent } from "@/lib/analytics";
import { parseYearMonth } from "@/lib/date";
import { groupByYear, latestYear } from "@/lib/group-by-year";
import type { Study } from "@/types/api";

import { sortByLatest } from "../lib/study-sort";

import StudyCard from "./StudyCard";

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
 * /studies 본문 (P-03). 진행 중 스터디 그리드 + 연도별 과거 스터디 슬라이드.
 *
 * - 정렬: 항상 최신순 (고르는 메뉴 없음).
 * - 과거 스터디: 시작 연도별 버튼(오래된 → 최신, 기본은 가장 최근 연도) + 카드 슬라이드.
 *   카드가 많으면 가로 스크롤(스와이프 · 트랙패드)과 좌우 화살표 버튼을 함께 쓴다 (CardSlider).
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
        {/* 스터디 페이지는 섹션 배지 없이 제목만 둔다 */}
        <SectionHeader title={currentText.title} titleId="current-studies-title" />
        {current.length === 0 ? (
          <EmptyState message={currentText.empty} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortByLatest(current).map((study) => (
              <li key={study.id} className="min-w-0">
                <StudyCard study={study} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 과거 스터디 — 연도별 넘기기 */}
      <section aria-labelledby="past-studies-title" className={CONTAINER}>
        {/* 스터디 페이지는 섹션 배지 없이 제목만 둔다 */}
        <SectionHeader title={pastText.title} titleId="past-studies-title" />
        {selectedGroup === null ? (
          <EmptyState message={pastText.empty} />
        ) : (
          <div className="flex flex-col gap-6">
            <YearButtons
              years={pastGroups.map((group) => group.year)}
              selectedYear={selectedGroup.year}
              onSelect={selectYear}
            />
            {/* 연도가 바뀌면 key 가 바뀌어 슬라이드가 맨 앞으로 간다 */}
            <CardSlider
              key={selectedGroup.year}
              label={`${selectedGroup.year}년 과거 스터디 (${selectedGroup.items.length}개)`}
            >
              {sortByLatest(selectedGroup.items).map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </CardSlider>
          </div>
        )}
      </section>
    </>
  );
}
