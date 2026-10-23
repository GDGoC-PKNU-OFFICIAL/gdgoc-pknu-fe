// src/components/admin/lib/redirect-to-login.ts
// 관리자 화면 → 로그인 이동 (IA 8-2). 세션 만료 감시(useSessionExpiry)와 저장 요청의 401(useAdminMutation)이 함께 쓴다.

import {
  ADMIN_NEXT_PARAM,
  ADMIN_REASON_EXPIRED,
  ADMIN_REASON_PARAM,
  ADMIN_ROUTES,
} from "@/constants/routes";

/**
 * 전체 페이지 이동으로 로그인에 보낸다. 클라이언트 라우터 이동은 캐시된 관리자 화면을 보여 줄 수 있고,
 * 전체 이동이어야 proxy.ts 가 다시 돌아 만료 쿠키를 지운다.
 * 로그인 후 지금 화면으로 돌아오도록 next 에 현재 경로를 담는다 — 폼이면 임시 저장본 복원 확인이 뜬다 (PRD 4-6).
 * expired 면 로그인 폼이 만료 안내를 보여 주도록 reason 을 붙인다 (쿠키가 처음부터 없던 경우는 붙이지 않는다).
 */
export function redirectToLogin(expired: boolean): void {
  const { pathname, search } = window.location;
  const loginUrl = new URL(ADMIN_ROUTES.login, window.location.origin);
  loginUrl.searchParams.set(ADMIN_NEXT_PARAM, `${pathname}${search}`);
  if (expired) loginUrl.searchParams.set(ADMIN_REASON_PARAM, ADMIN_REASON_EXPIRED);
  window.location.assign(loginUrl);
}
