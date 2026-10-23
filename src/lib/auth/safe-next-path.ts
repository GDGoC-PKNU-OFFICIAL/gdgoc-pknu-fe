// src/lib/auth/safe-next-path.ts
// 로그인 후 이동 경로 검사 — 오픈 리다이렉트 방지 (API 명세서 1-3 · IA 8-2).
// proxy.ts(로그인 상태로 /admin/login 진입)와 로그인 폼(로그인 성공 직후) 양쪽에서 쓰므로 "server-only" 를 넣지 않는다.
//
// 명세 규칙: "/admin 으로 시작하고 // 로 시작하지 않는 값만 허용, 그 외 /admin".
// 여기에 두 가지를 더 막는다. 둘 다 명세가 허용하는 값의 부분집합만 통과시키므로 규칙과 충돌하지 않는다.
// - 경로를 정규화한 뒤 검사한다. "/admin/../projects" 는 문자열로는 /admin 으로 시작하지만 실제로는 /projects 다.
// - /admin/login 자체는 돌려보내지 않는다. 로그인 상태에서 next=/admin/login 이면 proxy 가 자기 자신으로
//   리다이렉트하는 무한 루프가 된다.

import { ADMIN_ROUTES } from "@/constants/routes";

/** 정규화용 가짜 origin. 결과의 origin 이 이것과 다르면 next 가 다른 호스트를 가리킨 것이다 */
const BASE = "http://admin.invalid";

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_ROUTES.dashboard || pathname.startsWith(`${ADMIN_ROUTES.dashboard}/`);
}

/** 안전하면 정규화된 경로(path + query + hash)를, 아니면 대시보드 경로를 돌려준다 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return ADMIN_ROUTES.dashboard;

  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return ADMIN_ROUTES.dashboard;
  }

  if (url.origin !== BASE) return ADMIN_ROUTES.dashboard; // "/\evil.com" 처럼 브라우저가 호스트로 읽는 값
  if (!isAdminPath(url.pathname) || url.pathname === ADMIN_ROUTES.login) {
    return ADMIN_ROUTES.dashboard;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
