// src/lib/api/admin-api.ts
// 관리자 브라우저 → Next BFF(/api/admin/*). Spring 을 직접 부르지 않는다 (API 명세서 1-1, FRONT_ARCHITECTURE § 5-1).
// 쿠키는 같은 origin 이라 자동으로 실린다. 실패는 http.ts 가 ApiError 로 던진다 — 401 이면 호출부가 로그인으로 보낸다.
// 도메인 CRUD 는 각 관리자 화면을 만들 때 아래 "리소스별" 구역에 추가한다.

import { ADMIN_API_TIMEOUT_MS } from "@/constants/config";
import type { Project, SessionResponse, SlugCheckResponse } from "@/types/api";
import type { Page } from "@/types/common";
import type {
  LoginRequest,
  ProjectListQuery,
  ProjectRequest,
  SlugCheckQuery,
} from "@/types/request";

import { requestJson } from "./http";

/** BFF 가 Spring 콜드 스타트를 기다리는 시간보다 조금 길게 — BFF 의 504 를 받아 메시지를 보여 주기 위해 */
const BROWSER_TIMEOUT_MS = ADMIN_API_TIMEOUT_MS + 5_000;

const ADMIN_API_BASE = "/api/admin";

type QueryValue = string | number | undefined;

/** 값이 있는 쿼리만 붙인다. 생략한 값은 서버 기본값을 쓴다 (명세 1-6) */
function withQuery(path: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(`${ADMIN_API_BASE}${path}`, {
    cache: "no-store",
    signal,
    timeoutMs: BROWSER_TIMEOUT_MS,
  });
}

function sendJson<T>(method: "POST" | "PUT", path: string, body: unknown): Promise<T> {
  return requestJson<T>(`${ADMIN_API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    timeoutMs: BROWSER_TIMEOUT_MS,
  });
}

function deleteResource(path: string): Promise<void> {
  return requestJson<void>(`${ADMIN_API_BASE}${path}`, {
    method: "DELETE",
    timeoutMs: BROWSER_TIMEOUT_MS,
  });
}

// ============================================================
// 인증 (Next BFF 전용 라우트 — Spring 경로가 아니다)
// ============================================================

/**
 * 로그인. 성공하면 BFF 가 httpOnly 쿠키를 굽고 만료 시각만 돌려준다 (토큰은 브라우저로 오지 않는다).
 * 실패: 400 VALIDATION_FAILED(fieldErrors) · 401 LOGIN_FAILED · 502/504(Spring 응답 없음)
 */
export function login(body: LoginRequest): Promise<SessionResponse> {
  return sendJson<SessionResponse>("POST", "/login", body);
}

/** 쿠키 JWT 의 만료 시각. 쿠키가 없거나 만료면 401 (Spring 호출 없음) */
export function getSession(): Promise<SessionResponse> {
  return requestJson<SessionResponse>(`${ADMIN_API_BASE}/session`, { cache: "no-store" });
}

/** 쿠키 삭제. 폼 임시 저장본 삭제는 호출부가 함께 한다 (PRD 4-6) */
export function logout(): Promise<void> {
  return requestJson<void>(`${ADMIN_API_BASE}/logout`, { method: "POST" });
}

// ============================================================
// 2-4 프로젝트 관리
// ============================================================

/** A-11 목록. 기본 정렬 periodStart,desc · 크기 20 (서버 기본값) */
export function getAdminProjects(
  query: ProjectListQuery,
  signal?: AbortSignal,
): Promise<Page<Project>> {
  return getJson<Page<Project>>(withQuery("/projects", { ...query }), signal);
}

/** A-13 수정 폼 초기값. 없으면 404 NOT_FOUND */
export function getAdminProject(id: number, signal?: AbortSignal): Promise<Project> {
  return getJson<Project>(`/projects/${id}`, signal);
}

/** A-12 등록 → 201 + Project. 슬러그 중복은 409 SLUG_DUPLICATED (fieldErrors: slug) */
export function createProject(body: ProjectRequest): Promise<Project> {
  return sendJson<Project>("POST", "/projects", body);
}

/** A-13 수정 (전체 필드 교체) → 200 + Project */
export function updateProject(id: number, body: ProjectRequest): Promise<Project> {
  return sendJson<Project>("PUT", `/projects/${id}`, body);
}

/** 삭제 → 204. 팀원 행도 함께 지워진다 */
export function deleteProject(id: number): Promise<void> {
  return deleteResource(`/projects/${id}`);
}

/** 슬러그 중복 확인. 수정 화면은 excludeId 로 자기 자신을 뺀다 */
export function checkProjectSlug(
  query: SlugCheckQuery,
  signal?: AbortSignal,
): Promise<SlugCheckResponse> {
  return getJson<SlugCheckResponse>(withQuery("/projects/slug-check", { ...query }), signal);
}
