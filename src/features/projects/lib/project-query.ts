// src/features/projects/lib/project-query.ts
// /projects 의 URL 쿼리 규칙 (IA 6-1 · 6-3).
//   ?project={slug}  상세 카드 열림       ?pastYear={연도}  과거 프로젝트 선택 연도
//
// 쿼리를 바꿀 때는 Next 라우터가 아니라 window.history 를 직접 쓴다.
// Next 16 은 history.pushState · replaceState 를 가로채 useSearchParams 에 반영하므로(공식 문서
// "Native History API"), 서버에 다시 요청하지 않고 URL 과 화면이 함께 바뀐다.

import { PUBLIC_ROUTES } from "@/constants/routes";

export const PROJECT_QUERY = "project";
export const PAST_YEAR_QUERY = "pastYear";

/**
 * 목록에서 "자세히 보기"로 연 히스토리 항목에 남기는 표시 (IA 6-3).
 * 이 표시가 있으면 닫기 = history.back(), 없으면(공유 링크로 바로 진입) 닫기 = replace 로 쿼리 제거.
 * history.state 에 두므로 새로고침해도 남는다.
 */
export const OPENED_FROM_LIST_STATE_KEY = "gdgProjectOpenedFromList";

/** 상세 카드 링크. JS 가 없거나 다른 페이지(홈)에서 눌러도 이 주소로 이동해 열린다 */
export function projectDetailHref(slug: string): string {
  return `${PUBLIC_ROUTES.projects}?${PROJECT_QUERY}=${encodeURIComponent(slug)}`;
}

/**
 * 현재 주소(window.location)의 쿼리를 바꾼 URL 을 만든다. value 가 null 이면 해당 쿼리를 지운다.
 * 다른 쿼리(pastYear ↔ project)는 그대로 유지한다.
 */
export function urlWithQuery(changes: Record<string, string | null>): string {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const search = params.toString();
  return `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
}

// ------------------------------------------------------------
// 히스토리 조작
// ⚠️ 첫 인자로 window.history.state 를 그대로 넘기지 않는다. Next 내부 표시(__NA)가 들어 있으면
//    Next 가 "자기가 한 조작"으로 보고 useSearchParams 를 갱신하지 않는다. 우리 표시만 담아 넘기면
//    Next 가 내부 상태를 복사해 붙인다 (next/dist/client/components/app-router.js).
// ------------------------------------------------------------

export function isOpenedFromList(): boolean {
  return window.history.state?.[OPENED_FROM_LIST_STATE_KEY] === true;
}

/** 목록에서 상세 카드를 열 때 — 히스토리 한 칸 추가 + 표시 */
export function pushFromList(url: string): void {
  window.history.pushState({ [OPENED_FROM_LIST_STATE_KEY]: true }, "", url);
}

/** 히스토리를 쌓지 않고 주소만 바꾼다 (연도 변경 · 잘못된 쿼리 교정 · 공유 링크 진입 후 닫기) */
export function replaceUrl(url: string): void {
  window.history.replaceState(
    isOpenedFromList() ? { [OPENED_FROM_LIST_STATE_KEY]: true } : null,
    "",
    url,
  );
}
