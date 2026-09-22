// src/features/events/lib/sort-events.ts
// 일정 정렬 기준: date 오름차순 → 같은 날짜는 sortOrder 오름차순 (PRD 3-4 Events, API 2-1).
// 공개 API 가 이미 이 순서로 주지만, 필터 · 분할 후 다시 정렬할 때 기준을 한 곳에 둔다.

import type { EventItem } from "@/types/api";

export function compareEvents(
  a: Pick<EventItem, "date" | "sortOrder">,
  b: Pick<EventItem, "date" | "sortOrder">,
): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1; // "YYYY-MM-DD" 는 문자열 비교 = 날짜 비교
  return a.sortOrder - b.sortOrder;
}
