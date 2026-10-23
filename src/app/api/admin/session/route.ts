// GET /api/admin/session — 세션 조회 (API 명세서 2-10)
// 쿠키의 JWT 를 Next 가 직접 검증해 만료 시각만 돌려준다. Spring 을 부르지 않으므로 콜드 스타트와 무관하다.
// 관리자 화면의 만료 10분 전 안내(useSessionExpiry, IA 8-2)가 이 값을 쓴다.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { errorJson } from "@/lib/api/bff-response";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/cookie";
import { verifyAdminToken } from "@/lib/auth/jwt";
import { toKstDateTime } from "@/lib/date";
import type { SessionResponse } from "@/types/api";

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return errorJson(401, "UNAUTHORIZED", "로그인이 필요합니다.");

  const result = await verifyAdminToken(token);
  if (!result.ok) {
    return result.reason === "expired"
      ? errorJson(401, "TOKEN_EXPIRED", "로그인이 만료되었습니다. 다시 로그인해 주세요.")
      : errorJson(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  }

  return NextResponse.json<SessionResponse>({ expiresAt: toKstDateTime(result.expiresAt) });
}
