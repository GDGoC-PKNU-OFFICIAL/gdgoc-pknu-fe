// src/components/admin/hooks/use-current-year-month.ts
// 이번 달(KST) — 관리자 폼의 "진행 중 / 완료" 자동 표시와 연도 선택 범위에 쓴다.
// 렌더 중에 시계를 읽으면 서버 · 브라우저 값이 달라질 수 있어(자정 · 월말 전후) 서버 렌더링 때는 null 을 준다.

import { useSyncExternalStore } from "react";

import { currentYearMonthKst } from "@/lib/date";
import type { YearMonth } from "@/types/api";

const subscribeNothing = () => () => {};

/** 브라우저: "YYYY.MM" (같은 달 동안 같은 문자열이라 렌더가 안정적이다) / 서버 렌더링: null */
export function useCurrentYearMonth(): YearMonth | null {
  return useSyncExternalStore(subscribeNothing, currentYearMonthKst, () => null);
}
