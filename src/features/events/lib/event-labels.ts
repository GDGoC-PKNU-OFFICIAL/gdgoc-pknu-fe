// src/features/events/lib/event-labels.ts
// 일정 화면 전용 표시 규칙. 코드값 → 라벨은 constants/labels.ts(API 3-10)가 출처다.
// 카테고리는 색상 표시에만 쓴다 — 필터가 없다 (PRD 3-4). 색만으로 구분되지 않도록 목록에는 라벨을 함께 쓴다.

import { formatIsoDate } from "@/lib/date";
import type { EventCategory, EventItem, IsoDate } from "@/types/api";

/** Tailwind 가 찾을 수 있도록 클래스를 통째로 적는다. dot = 범례 · 일정 행의 점, bar = 캘린더 막대 */
export const EVENT_CATEGORY_STYLES = {
  meeting: {
    dot: "bg-brand-blue",
    bar: "border-l-brand-blue bg-brand-blue/10",
    mobileBar: "max-sm:bg-brand-blue",
  },
  // 정기 세션으로 합쳐 보인다 — meeting 과 같은 색
  seminar: {
    dot: "bg-brand-blue",
    bar: "border-l-brand-blue bg-brand-blue/10",
    mobileBar: "max-sm:bg-brand-blue",
  },
  project: {
    dot: "bg-[#9334e6]",
    bar: "border-l-[#9334e6] bg-[#9334e6]/10",
    mobileBar: "max-sm:bg-[#9334e6]",
  },
  study: {
    dot: "bg-brand-green",
    bar: "border-l-brand-green bg-brand-green/10",
    mobileBar: "max-sm:bg-brand-green",
  },
  festival: {
    dot: "bg-brand-yellow",
    bar: "border-l-brand-yellow bg-brand-yellow/15",
    mobileBar: "max-sm:bg-brand-yellow",
  },
  // 프로젝트로 합쳐 보인다 — project 와 같은 색
  presentation: {
    dot: "bg-[#9334e6]",
    bar: "border-l-[#9334e6] bg-[#9334e6]/10",
    mobileBar: "max-sm:bg-[#9334e6]",
  },
  milestone: {
    dot: "bg-brand-red",
    bar: "border-l-brand-red bg-brand-red/10",
    mobileBar: "max-sm:bg-brand-red",
  },
} satisfies Record<EventCategory, { dot: string; bar: string; mobileBar: string }>;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 캘린더 머리글. 일요일부터 */
export const WEEKDAY_LABELS = WEEKDAYS;

function withWeekday(date: IsoDate): string {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return `${formatIsoDate(date)} (${WEEKDAYS[weekday]})`;
}

/**
 * 일정 날짜 표시.
 * @example formatEventDate({ date: "2026-09-20" }) // "2026.09.20 (일)"
 * @example formatEventDate({ date: "2026-09-20", endDate: "2026-09-22" }) // "2026.09.20 (일) – 2026.09.22 (화)"
 */
export function formatEventDate({ date, endDate }: Pick<EventItem, "date" | "endDate">): string {
  if (!endDate || endDate === date) return withWeekday(date);
  return `${withWeekday(date)} – ${withWeekday(endDate)}`;
}
