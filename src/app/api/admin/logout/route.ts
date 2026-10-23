// POST /api/admin/logout — 로그아웃 (API 명세서 2-10)
// 쿠키만 지운다. 서버 측 토큰 폐기는 없다 — 이미 복사된 토큰은 만료(8시간)까지 Spring 에서 유효하다.
// 폼 임시 저장본 삭제(PRD 4-6)는 localStorage 라 서버가 할 수 없다. 관리자 화면이 이 요청 직후에 지운다.

import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME, EXPIRED_ADMIN_COOKIE_OPTIONS } from "@/lib/auth/cookie";

export async function POST() {
  (await cookies()).set(ADMIN_COOKIE_NAME, "", EXPIRED_ADMIN_COOKIE_OPTIONS);
  return new Response(null, { status: 204 });
}
