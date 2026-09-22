// src/features/events/lib/filter-upcoming.ts
// 다가오는 일정 판정 (PRD 3-4 홈 · API 3-6): (endDate ?? date) ≥ 오늘(KST).
// 진행 중인 여러 날 일정도 포함하므로 endDate 를 우선 본다.
//
// today 를 인자로 받는 이유: 테스트에서 날짜를 고정하고, 클라이언트에서 마운트 후 계산한 값을
// 넘길 수 있게 하기 위함. 생략하면 호출 시점의 todayKst().

import { todayKst } from "@/lib/date";
import type { EventItem, IsoDate } from "@/types/api";
import { compareEvents } from "./sort-events";

export function isUpcomingEvent(
  event: Pick<EventItem, "date" | "endDate">,
  today: IsoDate = todayKst(),
): boolean {
  return (event.endDate ?? event.date) >= today;
}

/**
 * 지난 일정을 걸러 내고, 가까운 순(date → sortOrder)으로 정렬해 최대 limit 개를 돌려준다.
 * 원본 배열은 바꾸지 않는다.
 */
export function upcomingEvents(
  events: readonly EventItem[],
  { today = todayKst(), limit = 3 }: { today?: IsoDate; limit?: number } = {},
): EventItem[] {
  return events
    .filter((e) => isUpcomingEvent(e, today))
    .sort(compareEvents)
    .slice(0, limit);
}

/** Events 페이지 일정 목록용: 다가오는 일정 / 지난 일정으로 나눈다 (PRD 3-4 Events) */
export function splitEventsByToday(
  events: readonly EventItem[],
  today: IsoDate = todayKst(),
): { upcoming: EventItem[]; past: EventItem[] } {
  const upcoming: EventItem[] = [];
  const past: EventItem[] = [];
  for (const e of events) (isUpcomingEvent(e, today) ? upcoming : past).push(e);
  upcoming.sort(compareEvents);
  // 지난 일정은 최근 날짜부터. 같은 날짜 안에서는 관리자가 정한 순서(sortOrder 오름차순)를 유지한다.
  past.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.sortOrder - b.sortOrder));
  return { upcoming, past };
}
