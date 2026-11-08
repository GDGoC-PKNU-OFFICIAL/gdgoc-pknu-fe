// src/features/studies/admin/study-schema.ts
// 스터디 등록 · 수정 폼 (A-22 · A-23) 의 값 모양 · 1차 검증 · 요청 변환 (API 명세서 4-3, FRONT_ARCHITECTURE § 5-4).
//
// 폼 값 모양은 요청(StudyRequest)과 같은 경로를 쓴다 — Spring fieldErrors 의 "outputs[0].url" · "period.end" 가
// 그대로 폼 필드에 붙는다 (apply-field-errors.ts). 비운 칸은 폼에서 "", 요청에서 null 이다 (명세 1-4).
// 글자 수 · 개수 제한은 constants/limits.ts 에서만 가져온다.

import { z } from "zod";

import { HTTP_URL_PATTERN, SLUG_PATTERN, STUDY_LIMITS } from "@/constants/limits";
import { isYearMonth } from "@/lib/date";
import type { Study } from "@/types/api";
import type { StudyRequest } from "@/types/request";

const L = STUDY_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  maxItems: (max: number) => `최대 ${max}개까지 입력할 수 있습니다.`,
  emptyItem: "내용을 입력하거나 항목을 삭제해 주세요.",
  slugFormat: "영문 소문자 · 숫자 · 하이픈만 쓸 수 있습니다. (예: android-basic)",
  periodStart: "시작 연월을 선택해 주세요.",
  periodEnd: "종료 연월을 끝까지 선택하거나 '진행 중'으로 두세요.",
  periodOrder: "종료는 시작과 같은 달이거나 그 이후여야 합니다.",
  duplicate: "중복된 항목이 있습니다.",
  url: "http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.",
} as const;

/** 앞뒤 공백을 지운 뒤 검사한다 (명세 4장 도입부) */
const requiredText = (max: number) =>
  z.string().trim().min(1, MESSAGES.required).max(max, MESSAGES.maxLength(max));

const optionalText = (max: number) => z.string().trim().max(max, MESSAGES.maxLength(max));

const listItem = (max: number) =>
  z.string().trim().min(1, MESSAGES.emptyItem).max(max, MESSAGES.maxLength(max));

export const studyFormSchema = z.object({
  title: requiredText(L.title),
  slug: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(L.slug, MESSAGES.maxLength(L.slug))
    .regex(SLUG_PATTERN, MESSAGES.slugFormat),
  topic: requiredText(L.topic),
  summary: requiredText(L.summary),
  period: z
    .object({
      start: z.string().refine(isYearMonth, MESSAGES.periodStart),
      end: z.string().refine((value) => value === "" || isYearMonth(value), MESSAGES.periodEnd),
    })
    .superRefine(({ start, end }, ctx) => {
      // "YYYY.MM" 은 자릿수가 고정이라 문자열 비교가 곧 날짜 비교다
      if (isYearMonth(start) && isYearMonth(end) && end < start) {
        ctx.addIssue({ code: "custom", path: ["end"], message: MESSAGES.periodOrder });
      }
    }),
  leader: requiredText(L.leader),
  participants: z
    .array(listItem(L.participants.itemLength))
    .max(L.participants.max, MESSAGES.maxItems(L.participants.max))
    .refine((items) => new Set(items).size === items.length, MESSAGES.duplicate),
  format: optionalText(L.format),
  outputs: z
    .array(
      z.object({
        label: requiredText(L.outputs.labelLength),
        url: z
          .string()
          .trim()
          .min(1, MESSAGES.required)
          .max(L.outputs.url, MESSAGES.maxLength(L.outputs.url))
          .regex(HTTP_URL_PATTERN, MESSAGES.url),
      }),
    )
    .max(L.outputs.max, MESSAGES.maxItems(L.outputs.max)),
});

/** 폼이 들고 있는 값 (입력 중 · 임시 저장본) */
export type StudyFormValues = z.input<typeof studyFormSchema>;
/** 검증을 통과해 앞뒤 공백까지 정리된 값 */
export type StudyFormOutput = z.output<typeof studyFormSchema>;

export function emptyStudyForm(): StudyFormValues {
  return {
    title: "",
    slug: "",
    topic: "",
    summary: "",
    period: { start: "", end: "" },
    leader: "",
    participants: [],
    format: "",
    outputs: [],
  };
}

/** 수정 폼 초기값. 응답에서 생략된 선택 필드(명세 1-4)는 빈 칸으로 */
export function studyToForm(study: Study): StudyFormValues {
  return {
    title: study.title,
    slug: study.slug,
    topic: study.topic,
    summary: study.summary,
    period: { start: study.period.start, end: study.period.end ?? "" },
    leader: study.leader,
    participants: [...study.participants],
    format: study.format ?? "",
    outputs: study.outputs.map(({ label, url }) => ({ label, url })),
  };
}

/** 요청 본문. 모든 필드를 보내고, 비운 값은 null · [] (명세 1-4) */
export function toStudyRequest(values: StudyFormOutput): StudyRequest {
  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    topic: values.topic,
    period: { start: values.period.start, end: values.period.end || null },
    leader: values.leader,
    participants: values.participants,
    format: values.format || null,
    outputs: values.outputs,
  };
}
