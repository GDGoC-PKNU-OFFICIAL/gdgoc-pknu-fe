// src/features/projects/lib/project-query.ts
// /projects 의 URL 쿼리 규칙 (IA 6-1 · 6-3).
//   ?project={slug}  상세 카드 열림       ?pastYear={연도}  과거 프로젝트 선택 연도

import { PUBLIC_ROUTES } from "@/constants/routes";

export const PROJECT_QUERY = "project";
export const PAST_YEAR_QUERY = "pastYear";

/** 상세 카드 링크. JS 가 없거나 다른 페이지(홈)에서 눌러도 이 주소로 이동해 열린다 */
export function projectDetailHref(slug: string): string {
  return `${PUBLIC_ROUTES.projects}?${PROJECT_QUERY}=${encodeURIComponent(slug)}`;
}

// 공용 URL · 히스토리 함수는 lib/url-query 에 있다 — 기존 import 경로를 위해 다시 내보낸다
export {
  isOpenedFromList,
  OPENED_FROM_LIST_STATE_KEY,
  pushFromList,
  replaceUrl,
  urlWithQuery,
} from "@/lib/url-query";
