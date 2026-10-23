// src/lib/api/bff-response.ts
// BFF(app/api/admin/**)가 브라우저에 돌려주는 에러 응답. 모양은 Spring 과 같은 명세 1-7 { code, message, fieldErrors } 다.
// 관리자 화면(admin-api.ts)은 Spring 이 만든 에러인지 BFF 가 만든 에러인지 구분하지 않고 같은 방식으로 처리한다.

import { NextResponse } from "next/server";

import type { ApiFieldError, ErrorResponse } from "@/types/common";

import type { ApiError } from "./api-error";

export function errorJson(
  status: number,
  code: ErrorResponse["code"],
  message: string,
  fieldErrors: ApiFieldError[] = [],
) {
  return NextResponse.json<ErrorResponse>({ code, message, fieldErrors }, { status });
}

/**
 * ApiError 를 그대로 응답으로 옮긴다. status 0(응답 없음)은 HTTP 로 표현할 수 없으므로
 * 게이트웨이 계열로 바꾼다 — 타임아웃은 504, 연결 실패는 502. code 는 TIMEOUT · NETWORK_ERROR 를 유지한다.
 */
export function apiErrorJson(error: ApiError) {
  const status = error.status !== 0 ? error.status : error.code === "TIMEOUT" ? 504 : 502;
  return errorJson(status, error.code, error.message, error.fieldErrors);
}
