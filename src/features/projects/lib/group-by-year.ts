// src/features/projects/lib/group-by-year.ts
// 과거 프로젝트 연도 버튼 + 슬라이드 (PRD 3-3-A).
// - 연도 기준: period.start 연도 (PRD 3-4 Projects)
// - 버튼 순서: 오래된 → 최신, 기본 선택: 데이터가 있는 가장 최근 연도
// - 데이터가 있는 연도만 만든다
//
// Map 대신 배열을 돌려준다: 순서가 명확하고, 서버 → 클라이언트 props 로 그대로 넘길 수 있다.

import { parseYearMonth } from "@/lib/date";
import { groupByYear, type YearGroup } from "@/lib/group-by-year";
import type { Project } from "@/types/api";

// 공용 함수는 lib/group-by-year 에 있다 — 기존 import 경로를 위해 다시 내보낸다
export { groupByYear, latestYear, resolveSelectedYear, type YearGroup } from "@/lib/group-by-year";

/** 프로젝트의 연도 버튼 기준 연도 */
export function periodStartYear(project: Pick<Project, "period">): number {
  return parseYearMonth(project.period.start).year;
}

/** 과거 프로젝트 전용 단축 함수 */
export function groupProjectsByStartYear<T extends Pick<Project, "period">>(
  projects: readonly T[],
): YearGroup<T>[] {
  return groupByYear(projects, periodStartYear);
}
