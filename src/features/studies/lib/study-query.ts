// src/features/studies/lib/study-query.ts
// /studies 의 URL 쿼리 규칙. ?study={slug} 이면 스터디 상세 카드가 열린다.
// 히스토리 조작(push · replace · "목록에서 열었는지" 표시)은 프로젝트 상세와 같은 규칙이라
// lib/url-query 의 공용 함수를 쓴다.

import { PUBLIC_ROUTES } from "@/constants/routes";

export const STUDY_QUERY = "study";

/** 상세 카드 링크. JS 가 없거나 다른 페이지(홈)에서 눌러도 이 주소로 이동해 열린다 */
export function studyDetailHref(slug: string): string {
  return `${PUBLIC_ROUTES.studies}?${STUDY_QUERY}=${encodeURIComponent(slug)}`;
}
