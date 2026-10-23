// src/lib/auth/jwt.ts
// 관리자 JWT 서명 · 만료 검증 (API 명세서 1-3). 발급은 Spring 이 하고, Next 는 검증만 한다.
// 최종 권한 판단은 항상 Spring 이 한다 — 여기서 통과해도 Spring 이 401 을 줄 수 있다 (PRD 4-3 ⑥).
//
// - 키: Spring JwtProvider 는 JWT_SECRET 문자열의 UTF-8 바이트를 그대로 HMAC 키로 쓴다 (base64 디코딩 없음).
//   그래서 여기서도 TextEncoder 로 같은 바이트를 만든다.
// - 알고리즘: Spring 이 키 길이와 무관하게 HS256 으로 고정해 발급한다. 다른 alg 의 토큰은 거부한다.
// - serverEnv import 로 "server-only" 가 따라온다. 키가 클라이언트 번들에 섞이지 않는다.

import { errors, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env/server";

const secretKey = new TextEncoder().encode(serverEnv.JWT_SECRET);

export type AdminTokenResult =
  { ok: true; expiresAt: Date } | { ok: false; reason: "expired" | "invalid" };

/** 서명 · 만료를 검증한다. 실패해도 throw 하지 않는다 — 호출부는 reason 으로 401 코드를 고른다 */
export async function verifyAdminToken(token: string): Promise<AdminTokenResult> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    // Spring 은 항상 exp 를 넣는다. 없으면 만료 없는 토큰이므로 위조로 본다
    if (payload.exp === undefined) return { ok: false, reason: "invalid" };
    return { ok: true, expiresAt: new Date(payload.exp * 1000) };
  } catch (error) {
    return { ok: false, reason: error instanceof errors.JWTExpired ? "expired" : "invalid" };
  }
}
