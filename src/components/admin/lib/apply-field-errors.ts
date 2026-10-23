// src/components/admin/lib/apply-field-errors.ts
// Spring 의 fieldErrors[{ field, message }] → react-hook-form setError (FRONT_ARCHITECTURE § 5-4 · API 명세서 4장).
//
// 경로 표기: Spring 은 "team[0].name" · "description[1]" · "period.end", RHF 는 "team.0.name" · "description.1".
// 대괄호 인덱스만 점 표기로 바꾸면 그대로 맞물린다.

import type { ApiFieldError } from "@/types/common";

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

/** @example toFormPath("team[0].name") // "team.0.name" */
export function toFormPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, ".$1");
}

/**
 * 서버 필드 에러를 폼 필드에 붙이고, 첫 번째 에러 필드로 포커스를 옮긴다.
 * 폼에 없는 필드(쿼리 파라미터 이름 등)의 에러는 붙이지 않고 돌려준다 — 호출부가 토스트 등으로 보여 준다.
 */
export function applyFieldErrors<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, "getValues" | "setError">,
  fieldErrors: readonly ApiFieldError[],
): ApiFieldError[] {
  const unmatched: ApiFieldError[] = [];
  let focused = false;
  for (const error of fieldErrors) {
    const path = toFormPath(error.field) as FieldPath<T>;
    // 값이 null 인 필드(thumbnailUrl 등)도 폼에 있는 필드다. undefined 만 "없는 필드"로 본다
    if (form.getValues(path) === undefined) {
      unmatched.push(error);
      continue;
    }
    form.setError(path, { type: "server", message: error.message }, { shouldFocus: !focused });
    focused = true;
  }
  return unmatched;
}
