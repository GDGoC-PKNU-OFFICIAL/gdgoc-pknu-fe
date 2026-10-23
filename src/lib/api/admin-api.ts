// src/lib/api/admin-api.ts
// 관리자 브라우저 → Next BFF(/api/admin/*). Spring 을 직접 부르지 않는다 (API 명세서 1-1, FRONT_ARCHITECTURE § 5-1).
// 쿠키는 같은 origin 이라 자동으로 실린다. 실패는 http.ts 가 ApiError 로 던진다 — 401 이면 호출부가 로그인으로 보낸다.
// 도메인 CRUD(프로젝트 · 스터디 …)는 각 관리자 화면을 만들 때 여기에 추가한다.

import { ADMIN_API_TIMEOUT_MS } from "@/constants/config";
import type { SessionResponse } from "@/types/api";
import type { LoginRequest } from "@/types/request";

import { requestJson } from "./http";

/**
 * 로그인. 성공하면 BFF 가 httpOnly 쿠키를 굽고 만료 시각만 돌려준다 (토큰은 브라우저로 오지 않는다).
 * 실패: 400 VALIDATION_FAILED(fieldErrors) · 401 LOGIN_FAILED · 502/504(Spring 응답 없음)
 */
export function login(body: LoginRequest): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // BFF 가 Spring 콜드 스타트를 기다리는 시간보다 조금 길게 — BFF 의 504 를 받아 메시지를 보여 주기 위해
    timeoutMs: ADMIN_API_TIMEOUT_MS + 5_000,
  });
}

/** 쿠키 JWT 의 만료 시각. 쿠키가 없거나 만료면 401 (Spring 호출 없음) */
export function getSession(): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/admin/session", { cache: "no-store" });
}

/** 쿠키 삭제. 폼 임시 저장본 삭제는 호출부가 함께 한다 (PRD 4-6) */
export function logout(): Promise<void> {
  return requestJson<void>("/api/admin/logout", { method: "POST" });
}
