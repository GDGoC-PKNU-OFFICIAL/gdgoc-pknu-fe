// src/types/common.ts
// 도메인을 모르는 공통 타입. API 명세서 1-6(목록 쿼리 기본형), 1-7(에러 응답), 3-7(Page<T>).
// components/ui 도 import 할 수 있는 파일이므로 types/api.ts 를 import 하지 않는다.

// ============================================================
// 3-7 Page<T> — 관리자 목록 공통 응답
// ============================================================

export interface Page<T> {
  items: T[];
  page: number; // 0부터 시작 (화면에는 page + 1)
  size: number;
  totalItems: number;
  totalPages: number;
}

// ============================================================
// 1-6 관리자 목록 공통 Query (도메인 무관 부분)
// ============================================================

export type SortDirection = "asc" | "desc";

/** "필드,방향" 형식의 sort 파라미터. 예: SortParam<"title"> → "title,asc" | "title,desc" */
export type SortParam<F extends string> = `${F},${SortDirection}`;

/**
 * 모든 관리자 목록 쿼리의 기본형. URL 쿼리이므로 요청 Body 의 "모든 필드 전송" 규칙(1-4)과 무관하고,
 * 생략하면 서버 기본값을 쓴다. 리소스별 필터(status · year · category · role)는 types/request.ts 에서 확장한다.
 */
export interface ListQueryBase<F extends string> {
  q?: string;
  page?: number; // 기본 0
  size?: number; // 기본 20, 최대 200
  sort?: SortParam<F>;
}

// ============================================================
// 1-7 에러 응답
// ============================================================

export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "INVALID_FILE_TYPE",
  "FILE_TOO_LARGE",
  "UPLOAD_VERIFICATION_FAILED",
  "LOGIN_FAILED",
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "NOT_FOUND",
  "SLUG_DUPLICATED",
  "INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * 필드별 유효성 에러.
 * react-hook-form 의 `FieldError` 와 이름이 겹치지 않도록 Api 접두사를 붙인다.
 */
export interface ApiFieldError {
  field: string; // "history", "period.end", "team[0].name" — RHF 경로 표기와 동일
  message: string;
}

/** 모든 에러 응답의 공통 형태 */
export interface ErrorResponse {
  /** 명세에 있는 코드는 자동완성되고, 서버가 새 코드를 추가해도 타입 에러가 나지 않는다 */
  code: ErrorCode | (string & {});
  message: string;
  fieldErrors?: ApiFieldError[];
}
