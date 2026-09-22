// src/lib/date.ts
// 도메인을 모르는 KST 날짜 유틸 (FRONT_ARCHITECTURE § 3: "KST 기준 오늘 · 이번 달, YYYY.MM 파싱").
// 도메인 로직은 각 feature 에 둔다:
//   - 다가오는 일정 판정       → features/events/lib/filter-upcoming.ts
//   - 과거 프로젝트 연도 묶기  → features/projects/lib/group-by-year.ts
//
// ⚠️ "오늘"을 어디서 계산하는가
//   - 서버 컴포넌트에서 부르면 값이 빌드 · ISR 시점에 고정된다 (최대 30분 이상 지연 가능).
//     → 홈 "다가오는 일정"처럼 지연이 허용되는 곳만 서버에서 계산한다.
//   - 캘린더의 오늘 강조 · 초기 월처럼 정확해야 하는 곳은 클라이언트에서 "마운트 후"(useEffect) 계산한다.
//     렌더 중에 서버 · 클라이언트가 각각 계산하면 자정 전후로 값이 달라져 hydration mismatch 가 난다.

import type { IsoDate, YearMonth } from "@/types/api";

export const KST_TIME_ZONE = "Asia/Seoul";

const kstDateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * 임의의 시각(instant)을 KST 달력 날짜 "YYYY-MM-DD" 로 변환한다.
 * Date 객체를 밀어서 만들지 않으므로 실행 환경의 타임존 · 서머타임과 무관하다.
 */
export function toKstDate(instant: Date): IsoDate {
  const parts = kstDateParts.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** 오늘(KST) "YYYY-MM-DD" */
export function todayKst(): IsoDate {
  return toKstDate(new Date());
}

/** 이번 달(KST) "YYYY.MM" — 캘린더 초기 월 등 */
export function currentYearMonthKst(): YearMonth {
  return todayKst().slice(0, 7).replace("-", ".");
}

// ------------------------------------------------------------
// "YYYY.MM" (YearMonth)
// ------------------------------------------------------------

const YEAR_MONTH_PATTERN = /^(\d{4})\.(0[1-9]|1[0-2])$/;

export function isYearMonth(value: string): value is YearMonth {
  return YEAR_MONTH_PATTERN.test(value);
}

/**
 * "YYYY.MM" → { year, month }. 형식이 틀리면 throw 한다
 * (NaN 을 조용히 흘려보내면 연도 버튼 · 정렬이 엉뚱하게 깨져 원인 찾기가 어렵다).
 */
export function parseYearMonth(value: YearMonth): { year: number; month: number } {
  const match = YEAR_MONTH_PATTERN.exec(value);
  if (!match) throw new Error(`YYYY.MM 형식이 아닙니다: "${value}"`);
  return { year: Number(match[1]), month: Number(match[2]) };
}

/** (year, month) → "YYYY.MM" — 캘린더 월 이동 결과를 다시 문자열로 */
export function formatYearMonth(year: number, month: number): YearMonth {
  return `${year}.${String(month).padStart(2, "0")}`;
}
