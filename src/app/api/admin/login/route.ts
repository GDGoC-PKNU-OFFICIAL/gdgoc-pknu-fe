// POST /api/admin/login — A-01 로그인 (API 명세서 2-10 · 5-1, PRD 4-3 ①~③)
// Spring 에 아이디 · 비밀번호를 넘기고, 받은 JWT 를 httpOnly 쿠키로 굽는다. 토큰은 응답 본문에 넣지 않는다.
// 입력 검사(공백 · 40자)와 LOGIN_FAILED 판정은 Spring 이 한다 — 본문을 손대지 않고 그대로 넘긴다.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_API_TIMEOUT_MS } from "@/constants/config";
import { ApiError } from "@/lib/api/api-error";
import { apiErrorJson, errorJson } from "@/lib/api/bff-response";
import { requestJson } from "@/lib/api/http";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS } from "@/lib/auth/cookie";
import { verifyAdminToken } from "@/lib/auth/jwt";
import { serverEnv } from "@/lib/env/server";
import type { LoginResponse, SessionResponse } from "@/types/api";

export async function POST(request: Request) {
  let issued: LoginResponse;
  try {
    issued = await requestJson<LoginResponse>(
      `${serverEnv.SPRING_API_BASE_URL}/api/admin/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await request.text(),
        cache: "no-store",
        timeoutMs: ADMIN_API_TIMEOUT_MS,
      },
    );
  } catch (error) {
    if (error instanceof ApiError) return apiErrorJson(error);
    throw error;
  }

  // Spring 이 발급한 토큰을 Next 가 검증하지 못하면 JWT_SECRET 이 두 서버에서 다른 것이다.
  // 그대로 쿠키를 구우면 proxy.ts 가 매번 거부해 로그인 페이지로 되돌아가는 루프가 되므로 여기서 끊는다.
  const verified = await verifyAdminToken(issued.token);
  if (!verified.ok) {
    console.error(
      "[admin/login] Spring 이 발급한 JWT 를 검증하지 못했습니다. JWT_SECRET 이 Render 와 같은지 확인하세요.",
    );
    return errorJson(500, "INTERNAL_ERROR", "일시적인 오류가 발생했습니다.");
  }

  (await cookies()).set(ADMIN_COOKIE_NAME, issued.token, ADMIN_COOKIE_OPTIONS);
  return NextResponse.json<SessionResponse>({ expiresAt: issued.expiresAt });
}
