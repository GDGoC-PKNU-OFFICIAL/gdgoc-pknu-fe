// src/features/studies/lib/study-sort.ts
// /studies 카드 순서는 항상 최신순 — 시작월이 늦은 것부터, 같으면 늦게 끝난 것부터.
// 기간 문자열은 "YYYY.MM" 이라 글자 비교만으로 시간 순서가 맞다. 진행 중(end 없음)은 가장 늦게 끝나는 것으로 본다.

import type { Study } from "@/types/api";

const endKey = (study: Study) => study.period.end ?? "9999.99";

/** 새 배열로 최신순 정렬해 돌려준다 (입력은 바꾸지 않는다) */
export function sortByLatest(studies: readonly Study[]): Study[] {
  return [...studies].sort(
    (a, b) => b.period.start.localeCompare(a.period.start) || endKey(b).localeCompare(endKey(a)),
  );
}
