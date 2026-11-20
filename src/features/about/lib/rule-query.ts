// src/features/about/lib/rule-query.ts
// /about 의 URL 쿼리 규칙. ?rule={slug} 이면 활동 규칙 상세 카드가 열린다.
// 히스토리 조작은 스터디 · 프로젝트 상세와 같은 lib/url-query 의 공용 함수를 쓴다.

import { PUBLIC_ROUTES } from "@/constants/routes";

export const RULE_QUERY = "rule";

/** 상세 카드 링크. JS 가 없어도 이 주소로 이동해 열린다 */
export function ruleDetailHref(slug: string): string {
  return `${PUBLIC_ROUTES.about}?${RULE_QUERY}=${encodeURIComponent(slug)}`;
}
