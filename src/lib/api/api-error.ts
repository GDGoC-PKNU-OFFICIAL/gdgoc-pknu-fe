// src/lib/api/api-error.ts
// API 호출 실패를 하나의 에러 타입으로 정규화한다 (FRONT_ARCHITECTURE § 3 · API 명세서 1-7).
// - 서버가 에러 응답 { code, message, fieldErrors? } 를 주면 그대로 담는다
// - 본문이 없거나 형식이 다르면(프록시 · 게이트웨이 HTML 등) HTTP 상태로 기본 메시지를 채운다
// - 네트워크 실패 · 타임아웃은 status 0 으로 표현한다 (HTTP 응답 자체가 없음)
//
// 관리자 폼(Phase 5)은 fieldErrors 를 react-hook-form setError 로 옮긴다 (apply-field-errors.ts).

import type { ApiFieldError, ErrorCode, ErrorResponse } from "@/types/common";

/** HTTP 응답이 없는 실패. ErrorCode(서버 코드)와 겹치지 않게 클라이언트 전용 코드를 둔다 */
export type ClientErrorCode = "NETWORK_ERROR" | "TIMEOUT";

const FALLBACK_MESSAGES: Record<ClientErrorCode, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없습니다.",
  TIMEOUT: "서버 응답이 지연되고 있습니다.",
};

/** 명세 1-7 표의 HTTP 상태별 기본 코드 — 본문을 해석하지 못했을 때만 쓴다 */
function codeForStatus(status: number): ErrorCode {
  if (status === 400) return "VALIDATION_FAILED";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "SLUG_DUPLICATED";
  if (status === 429) return "LOGIN_LOCKED";
  return "INTERNAL_ERROR";
}

/** Retry-After 헤더(초). 없거나 숫자가 아니면 undefined — HTTP 날짜 형식은 Spring 이 쓰지 않는다 */
function parseRetryAfter(res: Response): number | undefined {
  const raw = res.headers.get("Retry-After");
  if (raw === null || !/^\d+$/.test(raw.trim())) return undefined;
  return Number(raw.trim());
}

function isErrorResponse(body: unknown): body is ErrorResponse {
  if (typeof body !== "object" || body === null) return false;
  const { code, message } = body as Record<string, unknown>;
  return typeof code === "string" && typeof message === "string";
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  /** HTTP 상태. 응답을 받지 못했으면 0 */
  readonly status: number;
  readonly code: ErrorResponse["code"] | ClientErrorCode;
  /** 필드별 에러. 없으면 빈 배열 — 호출하는 쪽에서 undefined 확인이 필요 없다 */
  readonly fieldErrors: ApiFieldError[];
  /** 서버가 Retry-After(초)를 보냈으면 그 값. 지금은 429 LOGIN_LOCKED 만 보낸다 */
  readonly retryAfterSeconds: number | undefined;

  constructor(
    status: number,
    code: ApiError["code"],
    message: string,
    fieldErrors: ApiFieldError[] = [],
    options?: ErrorOptions & { retryAfterSeconds?: number },
  ) {
    super(message, options);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }

  /** 실패 응답(!res.ok)을 ApiError 로 바꾼다. 본문은 여기서 소비된다 */
  static async fromResponse(res: Response): Promise<ApiError> {
    const body: unknown = await res.json().catch(() => null);
    const options = { retryAfterSeconds: parseRetryAfter(res) };
    if (isErrorResponse(body)) {
      return new ApiError(res.status, body.code, body.message, body.fieldErrors ?? [], options);
    }
    return new ApiError(
      res.status,
      codeForStatus(res.status),
      `요청에 실패했습니다. (HTTP ${res.status})`,
      [],
      options,
    );
  }

  /** fetch 자체가 실패한 경우 (연결 거부 · DNS · 타임아웃) */
  static fromFetchFailure(cause: unknown): ApiError {
    const code: ClientErrorCode =
      cause instanceof DOMException && cause.name === "TimeoutError" ? "TIMEOUT" : "NETWORK_ERROR";
    return new ApiError(0, code, FALLBACK_MESSAGES[code], [], { cause });
  }
}
