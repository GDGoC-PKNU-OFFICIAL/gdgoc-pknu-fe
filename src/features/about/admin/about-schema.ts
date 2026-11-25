// src/features/about/admin/about-schema.ts
// About 수정 폼의 값 모양 · 1차 검증 · 요청 변환. 서버 검증(AboutRequest)과 같은 제한을 쓴다.
// 폼 값 경로는 요청과 같아서 Spring fieldErrors 의 "activities[0].title" · "rules[1].slug" 가 그대로 칸에 붙는다.

import { z } from "zod";

import { SLUG_PATTERN } from "@/constants/limits";
import {
  ABOUT_ACTIVITY_LAYOUTS,
  ABOUT_ACTIVITY_TONES,
  type AboutContent,
  RULE_ICONS,
} from "@/types/api";
import type { AboutRequest } from "@/types/request";

export const ABOUT_LIMITS = {
  identity: { min: 1, max: 5, itemLength: 1000 },
  activities: { min: 1, max: 12, titleLength: 30, descriptionLength: 200 },
  rules: { max: 6, slugLength: 60, titleLength: 30, bodyLength: 5000 },
  faq: { max: 20, questionLength: 100, answerLength: 1000 },
} as const;

const L = ABOUT_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  maxItems: (max: number) => `최대 ${max}개까지 입력할 수 있습니다.`,
  minItems: (min: number) => `${min}개 이상 입력해 주세요.`,
  emptyItem: "내용을 입력하거나 항목을 삭제해 주세요.",
  slugFormat: "영문 소문자 · 숫자 · 하이픈만 쓸 수 있습니다. (예: code-of-conduct)",
  slugDuplicate: "다른 규칙과 주소가 겹칩니다.",
  imageRequired: "이 모양은 사진이 필요합니다.",
  secondImageRequired: "원형 사진 두 장이 필요합니다.",
  position: "예: 35% 50% (가로 % 세로 %)",
} as const;

const requiredText = (max: number) =>
  z.string().trim().min(1, MESSAGES.required).max(max, MESSAGES.maxLength(max));

/** 사진이 필요한 모양 */
export const LAYOUTS_WITH_IMAGE = ["cover", "square", "top", "artwork", "circles"] as const;

/** 사진 확대 배율 % (서버 AboutRequest 와 같은 범위). 100 이면 확대하지 않는다 */
export const ZOOM = { min: 100, max: 300, step: 5 } as const;

/** 사진에서 보일 곳 "가로% 세로%" (각 0~100) — 빈 값이면 모양마다 정한 기본 위치 */
const positionField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^(100|\d{1,2})% (100|\d{1,2})%$/.test(value),
    MESSAGES.position,
  );
const zoomField = z.number().int().min(ZOOM.min).max(ZOOM.max);

const activitySchema = z
  .object({
    title: requiredText(L.activities.titleLength),
    description: requiredText(L.activities.descriptionLength),
    layout: z.enum(ABOUT_ACTIVITY_LAYOUTS),
    imageUrl: z.string().nullable(),
    secondImageUrl: z.string().nullable(),
    imagePosition: positionField,
    imageZoom: zoomField,
    secondImagePosition: positionField,
    secondImageZoom: zoomField,
    tone: z.enum(ABOUT_ACTIVITY_TONES),
  })
  .superRefine((value, ctx) => {
    if ((LAYOUTS_WITH_IMAGE as readonly string[]).includes(value.layout) && !value.imageUrl) {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: MESSAGES.imageRequired });
    }
    if (value.layout === "circles" && !value.secondImageUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["secondImageUrl"],
        message: MESSAGES.secondImageRequired,
      });
    }
  });

export const aboutFormSchema = z.object({
  identity: z
    .array(
      z
        .string()
        .trim()
        .min(1, MESSAGES.emptyItem)
        .max(L.identity.itemLength, MESSAGES.maxLength(L.identity.itemLength)),
    )
    .min(L.identity.min, MESSAGES.minItems(L.identity.min))
    .max(L.identity.max, MESSAGES.maxItems(L.identity.max)),
  activities: z
    .array(activitySchema)
    .min(L.activities.min, MESSAGES.minItems(L.activities.min))
    .max(L.activities.max, MESSAGES.maxItems(L.activities.max)),
  rules: z
    .array(
      z.object({
        slug: z
          .string()
          .trim()
          .min(1, MESSAGES.required)
          .max(L.rules.slugLength, MESSAGES.maxLength(L.rules.slugLength))
          .regex(SLUG_PATTERN, MESSAGES.slugFormat),
        title: requiredText(L.rules.titleLength),
        icon: z.enum(RULE_ICONS),
        body: requiredText(L.rules.bodyLength),
      }),
    )
    .max(L.rules.max, MESSAGES.maxItems(L.rules.max))
    .superRefine((rules, ctx) => {
      const seen = new Set<string>();
      rules.forEach((rule, index) => {
        if (seen.has(rule.slug)) {
          ctx.addIssue({ code: "custom", path: [index, "slug"], message: MESSAGES.slugDuplicate });
        }
        seen.add(rule.slug);
      });
    }),
  faq: z
    .array(
      z.object({
        question: requiredText(L.faq.questionLength),
        answer: requiredText(L.faq.answerLength),
      }),
    )
    .max(L.faq.max, MESSAGES.maxItems(L.faq.max)),
});

export type AboutFormValues = z.input<typeof aboutFormSchema>;
export type AboutFormOutput = z.output<typeof aboutFormSchema>;
export type ActivityFormValues = AboutFormValues["activities"][number];

export function emptyActivity(): ActivityFormValues {
  return {
    title: "",
    description: "",
    layout: "color",
    imageUrl: null,
    secondImageUrl: null,
    imagePosition: "",
    imageZoom: ZOOM.min,
    secondImagePosition: "",
    secondImageZoom: ZOOM.min,
    tone: "auto",
  };
}

export function aboutToForm(about: AboutContent): AboutFormValues {
  return {
    identity: [...about.identity],
    activities: about.activities.map((item) => ({
      title: item.title,
      description: item.description,
      layout: item.layout,
      imageUrl: item.imageUrl ?? null,
      secondImageUrl: item.secondImageUrl ?? null,
      imagePosition: item.imagePosition ?? "",
      imageZoom: item.imageZoom ?? ZOOM.min,
      secondImagePosition: item.secondImagePosition ?? "",
      secondImageZoom: item.secondImageZoom ?? ZOOM.min,
      tone: item.tone,
    })),
    rules: about.rules.map((rule) => ({ ...rule })),
    faq: about.faq.map((item) => ({ ...item })),
  };
}

/** 요청 본문. 모양에 쓰이지 않는 사진 · 위치는 null 로 보낸다 (남겨 두면 다음 모양 변경 때 헷갈린다) */
export function toAboutRequest(values: AboutFormOutput): AboutRequest {
  return {
    identity: values.identity,
    activities: values.activities.map((item) => {
      const usesImage = (LAYOUTS_WITH_IMAGE as readonly string[]).includes(item.layout);
      const circles = item.layout === "circles";
      // 100% 는 확대하지 않은 것과 같아 보내지 않는다
      const zoomOrNull = (zoom: number) => (zoom > ZOOM.min ? zoom : null);
      return {
        title: item.title,
        description: item.description,
        layout: item.layout,
        imageUrl: usesImage ? item.imageUrl : null,
        secondImageUrl: circles ? item.secondImageUrl : null,
        imagePosition: usesImage && item.imagePosition ? item.imagePosition : null,
        imageZoom: usesImage ? zoomOrNull(item.imageZoom) : null,
        secondImagePosition: circles && item.secondImagePosition ? item.secondImagePosition : null,
        secondImageZoom: circles ? zoomOrNull(item.secondImageZoom) : null,
        tone: item.tone,
      };
    }),
    rules: values.rules,
    faq: values.faq,
  };
}
