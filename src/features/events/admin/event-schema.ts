// src/features/events/admin/event-schema.ts
// 일정 등록 · 수정 폼 (A-32 · A-33) 의 값 모양 · 1차 검증 · 요청 변환 (API 명세서 4-4, FRONT_ARCHITECTURE § 5-4).
//
// 폼 값 모양은 요청(EventRequest)과 같은 경로를 쓴다 — Spring fieldErrors 의 "endDate" 가 그대로 폼 필드에 붙는다.
// 비운 칸은 폼에서 "", 요청에서 null 이다 (명세 1-4). sortOrder 는 폼에 없다 — 같은 날 순서는 목록(A-31)에서 바꾼다.

import { z } from "zod";

import { EVENT_LIMITS } from "@/constants/limits";
import { EVENT_CATEGORIES, type EventCategory, type EventItem } from "@/types/api";
import type { EventRequest } from "@/types/request";

const L = EVENT_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  category: "카테고리를 선택해 주세요.",
  date: "시작일을 선택해 주세요.",
  endDate: "날짜 형식이 올바르지 않습니다.",
  dateOrder: "종료일은 시작일과 같거나 그 이후여야 합니다.",
} as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" 이면서 실제로 있는 날짜인지 (2026-02-30 같은 값을 거른다) */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const requiredText = (max: number) =>
  z.string().trim().min(1, MESSAGES.required).max(max, MESSAGES.maxLength(max));

const optionalText = (max: number) => z.string().trim().max(max, MESSAGES.maxLength(max));

function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export const eventFormSchema = z
  .object({
    title: requiredText(L.title),
    category: z
      .string()
      .refine(isEventCategory, MESSAGES.category)
      .transform((value) => value as EventCategory),
    date: z.string().refine(isIsoDate, MESSAGES.date),
    endDate: z.string().refine((value) => value === "" || isIsoDate(value), MESSAGES.endDate),
    time: optionalText(L.time),
    place: optionalText(L.place),
    summary: optionalText(L.summary),
  })
  .superRefine(({ date, endDate }, ctx) => {
    // "YYYY-MM-DD" 는 자릿수가 고정이라 문자열 비교가 곧 날짜 비교다
    if (isIsoDate(date) && isIsoDate(endDate) && endDate < date) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: MESSAGES.dateOrder });
    }
  });

/** 폼이 들고 있는 값 (입력 중 · 임시 저장본) */
export type EventFormValues = z.input<typeof eventFormSchema>;
/** 검증을 통과해 앞뒤 공백까지 정리된 값 */
export type EventFormOutput = z.output<typeof eventFormSchema>;

export function emptyEventForm(): EventFormValues {
  return { title: "", category: "", date: "", endDate: "", time: "", place: "", summary: "" };
}

/** 수정 폼 초기값. 응답에서 생략된 선택 필드(명세 1-4)는 빈 칸으로 */
export function eventToForm(event: EventItem): EventFormValues {
  return {
    title: event.title,
    category: event.category,
    date: event.date,
    endDate: event.endDate ?? "",
    time: event.time ?? "",
    place: event.place ?? "",
    summary: event.summary ?? "",
  };
}

/** 요청 본문. 모든 필드를 보내고, 비운 값은 null (명세 1-4) */
export function toEventRequest(values: EventFormOutput): EventRequest {
  return {
    title: values.title,
    category: values.category,
    date: values.date,
    endDate: values.endDate || null,
    time: values.time || null,
    place: values.place || null,
    summary: values.summary || null,
  };
}
