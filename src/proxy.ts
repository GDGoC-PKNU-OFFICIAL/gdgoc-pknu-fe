// src/proxy.ts — /admin/* 라우트 가드 (Next 16 규약, 항상 Node.js 런타임 · runtime 설정 불가)
// 쿠키 JWT 의 서명 · 만료만 확인하는 "낙관적 검사"다. 최종 권한 판단은 Spring 이 모든 /api/admin/** 에서 한다 (PRD 4-3 ④ · ⑥).
//
// IA 8-2 접근 제어
//   | 상태              | /admin/login                  | /admin/* (그 외)                          |
//   | 비로그인 · 만료    | 로그인 폼                      | → /admin/login?next={원래 경로}           |
//   | 로그인            | → next 또는 /admin            | 통과                                      |
// 만료된 토큰으로 왔으면 &reason=expired 를 붙여 로그인 폼이 만료 안내를 보여 주게 한다 (IA 8-5).
//
// /api/admin/* 는 대상이 아니다. BFF 가 쿠키를 직접 읽고, 화면 이동이 아니라 401 JSON 으로 응답해야 하기 때문이다.

import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_NEXT_PARAM,
  ADMIN_REASON_EXPIRED,
  ADMIN_REASON_PARAM,
  ADMIN_ROUTES,
} from "@/constants/routes";
import { ADMIN_COOKIE_NAME, EXPIRED_ADMIN_COOKIE_OPTIONS } from "@/lib/auth/cookie";
import { verifyAdminToken } from "@/lib/auth/jwt";
import { safeNextPath } from "@/lib/auth/safe-next-path";

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const verified = token === undefined ? null : await verifyAdminToken(token);
  const authenticated = verified?.ok === true;

  if (pathname === ADMIN_ROUTES.login) {
    if (authenticated) {
      const next = safeNextPath(searchParams.get(ADMIN_NEXT_PARAM));
      return NextResponse.redirect(new URL(next, request.url));
    }
    return withoutStaleCookie(NextResponse.next(), token);
  }

  if (authenticated) return NextResponse.next();

  const loginUrl = new URL(ADMIN_ROUTES.login, request.url);
  loginUrl.searchParams.set(ADMIN_NEXT_PARAM, `${pathname}${search}`);
  if (verified?.ok === false && verified.reason === "expired") {
    loginUrl.searchParams.set(ADMIN_REASON_PARAM, ADMIN_REASON_EXPIRED);
  }
  return withoutStaleCookie(NextResponse.redirect(loginUrl), token);
}

/** 만료 · 위조 쿠키는 지운다. 남겨 두면 이후 모든 /admin 요청이 같은 검증 실패를 반복한다 */
function withoutStaleCookie(response: NextResponse, token: string | undefined) {
  if (token !== undefined) {
    response.cookies.set(ADMIN_COOKIE_NAME, "", EXPIRED_ADMIN_COOKIE_OPTIONS);
  }
  return response;
}

// /admin/:path* 는 0개 이상이라 /admin 자체도 포함한다. 정적 분석 대상이라 상수 대신 리터럴을 쓴다
export const config = {
  matcher: "/admin/:path*",
};
