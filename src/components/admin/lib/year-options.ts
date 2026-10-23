// src/components/admin/lib/year-options.ts
// 관리자 연도 필터 · 연월 선택의 연도 목록. 최신 연도가 위(첫 번째)에 온다.

import { ADMIN_YEAR_RANGE_START } from "@/constants/config";

/**
 * ADMIN_YEAR_RANGE_START ~ (올해 + 1) 를 내림차순으로.
 * 범위 밖 값이 이미 저장되어 있으면(옛 데이터 등) 그 연도도 넣어 선택이 풀리지 않게 한다.
 * currentYear 가 null(서버 렌더링)이면 이미 있는 값의 연도만 돌려준다.
 */
export function adminYears(currentYear: number | null, ...keep: (number | null)[]): number[] {
  const years = new Set<number>();
  if (currentYear !== null) {
    for (let year = currentYear + 1; year >= ADMIN_YEAR_RANGE_START; year--) years.add(year);
  }
  for (const year of keep) if (year !== null && Number.isInteger(year)) years.add(year);
  return [...years].sort((a, b) => b - a);
}
