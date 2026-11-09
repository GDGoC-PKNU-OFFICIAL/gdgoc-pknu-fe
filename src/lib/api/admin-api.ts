// src/lib/api/admin-api.ts
// 관리자 브라우저 → Next BFF(/api/admin/*). Spring 을 직접 부르지 않는다 (API 명세서 1-1, FRONT_ARCHITECTURE § 5-1).
// 쿠키는 같은 origin 이라 자동으로 실린다. 실패는 http.ts 가 ApiError 로 던진다 — 401 이면 호출부가 로그인으로 보낸다.
// 도메인 CRUD 는 각 관리자 화면을 만들 때 아래 "리소스별" 구역에 추가한다.

import { ADMIN_API_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from "@/constants/config";
import type {
  AdminMember,
  ImageContentType,
  PresignResponse,
  Project,
  SessionResponse,
  SlugCheckResponse,
  Study,
} from "@/types/api";
import type { Page } from "@/types/common";
import type {
  LoginRequest,
  MemberListQuery,
  MemberRequest,
  PresignRequest,
  ProjectListQuery,
  ProjectRequest,
  SlugCheckQuery,
  StudyListQuery,
  StudyRequest,
} from "@/types/request";

import { ApiError } from "./api-error";
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

// ============================================================
// 2-5 스터디 관리
// ============================================================

/** A-21 목록. q 검색 대상: 제목 · 리더. 기본 정렬 periodStart,desc · 크기 20 (서버 기본값) */
export function getAdminStudies(query: StudyListQuery, signal?: AbortSignal): Promise<Page<Study>> {
  return getJson<Page<Study>>(withQuery("/studies", { ...query }), signal);
}

/** A-23 수정 폼 초기값. 없으면 404 NOT_FOUND */
export function getAdminStudy(id: number, signal?: AbortSignal): Promise<Study> {
  return getJson<Study>(`/studies/${id}`, signal);
}

/** A-22 등록 → 201 + Study. 슬러그 중복은 409 SLUG_DUPLICATED (fieldErrors: slug) */
export function createStudy(body: StudyRequest): Promise<Study> {
  return sendJson<Study>("POST", "/studies", body);
}

/** A-23 수정 (전체 필드 교체) → 200 + Study */
export function updateStudy(id: number, body: StudyRequest): Promise<Study> {
  return sendJson<Study>("PUT", `/studies/${id}`, body);
}

/** 삭제 → 204. 참여자 · 결과물 행도 함께 지워진다 */
export function deleteStudy(id: number): Promise<void> {
  return deleteResource(`/studies/${id}`);
}

/** 슬러그 중복 확인. 수정 화면은 excludeId 로 자기 자신을 뺀다 */
export function checkStudySlug(
  query: SlugCheckQuery,
  signal?: AbortSignal,
): Promise<SlugCheckResponse> {
  return getJson<SlugCheckResponse>(withQuery("/studies/slug-check", { ...query }), signal);
}

// ============================================================
// 2-7 멤버 관리
// ============================================================

/** A-41 목록. q 검색 대상: 이름. 기본 정렬은 서버가 정한다 (구분 → 역할 순 → 이름) */
export function getAdminMembers(
  query: MemberListQuery,
  signal?: AbortSignal,
): Promise<Page<AdminMember>> {
  return getJson<Page<AdminMember>>(withQuery("/members", { ...query }), signal);
}

/** A-43 수정 폼 · 플립 카드 미리보기 초기값 (consentConfirmedAt 포함). 없으면 404 NOT_FOUND */
export function getAdminMember(id: number, signal?: AbortSignal): Promise<AdminMember> {
  return getJson<AdminMember>(`/members/${id}`, signal);
}

/** A-42 등록 → 201. 주요 이력 3개 이상 · 공개 동의 미확인은 400 + fieldErrors */
export function createMember(body: MemberRequest): Promise<AdminMember> {
  return sendJson<AdminMember>("POST", "/members", body);
}

/** A-43 수정 (전체 필드 교체). 시니어면 role 은 null 이어야 한다 */
export function updateMember(id: number, body: MemberRequest): Promise<AdminMember> {
  return sendJson<AdminMember>("PUT", `/members/${id}`, body);
}

/** 삭제 → 204. 프로젝트 · 스터디 기록에는 영향 없다 (참여자는 이름 문자열) */
export function deleteMember(id: number): Promise<void> {
  return deleteResource(`/members/${id}`);
}

// ============================================================
// 2-9 이미지 업로드 (FRONT_ARCHITECTURE § 5-5)
// ============================================================

/**
 * ① 업로드 주소 발급 (BFF 경유). 형식 · 신고 용량 위반은 400 INVALID_FILE_TYPE · FILE_TOO_LARGE
 * (fieldErrors: contentType · size — 폼 필드가 아니므로 호출부가 업로드 칸의 에러로 보여 준다)
 */
export function presignUpload(body: PresignRequest): Promise<PresignResponse> {
  return sendJson<PresignResponse>("POST", "/uploads/presign", body);
}

/**
 * ② 발급받은 주소로 R2 에 직접 PUT (BFF · Spring 을 거치지 않는다 — 명세 2-9).
 * Content-Type 이 서명에 포함되므로 발급 요청과 같은 값을 보낸다. 쿠키는 보내지 않는다(다른 origin).
 * R2 는 JSON 이 아닌 XML 에러를 돌려주므로 본문은 읽지 않고 상태만 본다.
 */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: ImageContentType,
  signal?: AbortSignal,
): Promise<void> {
  const timeout = AbortSignal.timeout(UPLOAD_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
      credentials: "omit",
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw ApiError.fromFetchFailure(cause);
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      "INTERNAL_ERROR",
      `이미지 업로드에 실패했습니다. (HTTP ${res.status})`,
    );
  }
}
