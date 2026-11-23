// src/features/projects/lib/project-sort.ts
// /projects 카드 순서는 항상 최신순 — 시작월이 늦은 것부터, 같으면 늦게 끝난 것부터.
// 공개 API 도 period.start 최신순으로 주지만, 화면 규칙이라 프론트에서 한 번 더 맞춘다 (스터디 study-sort.ts 와 같은 규칙).
// 기간 문자열은 "YYYY.MM" 이라 글자 비교만으로 시간 순서가 맞다. 진행 중(end 없음)은 가장 늦게 끝나는 것으로 본다.

import type { Project } from "@/types/api";

const endKey = (project: Pick<Project, "period">) => project.period.end ?? "9999.99";

/** 새 배열로 최신순 정렬해 돌려준다 (입력은 바꾸지 않는다) */
export function sortProjectsByLatest<T extends Pick<Project, "period">>(
  projects: readonly T[],
): T[] {
  return [...projects].sort(
    (a, b) => b.period.start.localeCompare(a.period.start) || endKey(b).localeCompare(endKey(a)),
  );
}
