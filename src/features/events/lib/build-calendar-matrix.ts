// src/features/events/lib/build-calendar-matrix.ts
// 월간 캘린더(P-04 #2)의 칸 계산. React 를 모르는 순수 함수다.
// 달력은 일요일에 시작하고, 앞뒤 달 날짜로 주를 채운다. 여러 날 일정은 주마다 이어진 막대 하나로 자른다.
//
// 날짜 계산은 Date.UTC 로만 한다 — 실행 환경 타임존과 무관하게 "YYYY-MM-DD" 문자열이 그대로 유지된다.

import { parseYearMonth } from "@/lib/date";
import type { EventItem, IsoDate, YearMonth } from "@/types/api";

import { compareEvents } from "./sort-events";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

export interface CalendarDay {
  date: IsoDate;
  /** 일 (1~31) */
  day: number;
  /** 보고 있는 달의 날짜인지 (앞뒤 달은 흐리게) */
  inMonth: boolean;
}

export interface CalendarBar {
  event: EventItem;
  /** 시작 칸 (0 = 일요일) */
  startColumn: number;
  /** 차지하는 칸 수 */
  span: number;
  /** 줄 번호 (0부터) */
  lane: number;
  /** 지난주에서 이어짐 · 다음 주로 이어짐 — 막대 끝 모양을 정한다 */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
  bars: CalendarBar[];
  /** 칸별로 줄이 모자라 못 보여 준 일정 수 ("+n") */
  hiddenCounts: number[];
}

function toUtc(date: IsoDate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function toIsoDate(utc: number): IsoDate {
  return new Date(utc).toISOString().slice(0, 10);
}

function placeBars(events: readonly EventItem[], days: CalendarDay[], maxLanes: number) {
  const weekStart = days[0].date;
  const weekEnd = days[days.length - 1].date;
  const bars: CalendarBar[] = [];
  const hiddenCounts = days.map(() => 0);
  /** 줄별로 마지막으로 찬 칸 */
  const laneEnds: number[] = [];

  for (const event of events) {
    const end = event.endDate ?? event.date;
    if (end < weekStart || event.date > weekEnd) continue;

    const continuesBefore = event.date < weekStart;
    const continuesAfter = end > weekEnd;
    const startColumn = continuesBefore ? 0 : (toUtc(event.date) - toUtc(weekStart)) / DAY_MS;
    const endColumn = continuesAfter ? DAYS_PER_WEEK - 1 : (toUtc(end) - toUtc(weekStart)) / DAY_MS;

    let lane = laneEnds.findIndex((laneEnd) => laneEnd < startColumn);
    if (lane === -1) lane = laneEnds.length;

    if (lane >= maxLanes) {
      for (let column = startColumn; column <= endColumn; column++) hiddenCounts[column]++;
      continue;
    }
    laneEnds[lane] = endColumn;
    bars.push({
      event,
      startColumn,
      span: endColumn - startColumn + 1,
      lane,
      continuesBefore,
      continuesAfter,
    });
  }
  return { bars, hiddenCounts };
}

/**
 * @param yearMonth 보고 있는 달 "YYYY.MM"
 * @param events 전체 일정. 같은 날짜는 sortOrder 순으로 위에서부터 놓는다
 * @param maxLanes 한 주에 보여 줄 줄 수. 넘치면 hiddenCounts 로 센다
 */
export function buildCalendarMatrix(
  yearMonth: YearMonth,
  events: readonly EventItem[],
  maxLanes: number,
): CalendarWeek[] {
  const { year, month } = parseYearMonth(yearMonth);
  const firstOfMonth = Date.UTC(year, month - 1, 1);
  const lastOfMonth = Date.UTC(year, month, 0);
  const gridStart = firstOfMonth - new Date(firstOfMonth).getUTCDay() * DAY_MS;

  const sorted = [...events].sort(compareEvents);
  const weeks: CalendarWeek[] = [];

  for (let weekStart = gridStart; weekStart <= lastOfMonth; weekStart += DAYS_PER_WEEK * DAY_MS) {
    const days = Array.from({ length: DAYS_PER_WEEK }, (_, offset) => {
      const utc = weekStart + offset * DAY_MS;
      return {
        date: toIsoDate(utc),
        day: new Date(utc).getUTCDate(),
        inMonth: utc >= firstOfMonth && utc <= lastOfMonth,
      };
    });
    weeks.push({ days, ...placeBars(sorted, days, maxLanes) });
  }
  return weeks;
}
