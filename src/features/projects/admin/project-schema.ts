// src/features/projects/admin/project-schema.ts
// 프로젝트 등록 · 수정 폼 (A-12 · A-13) 의 값 모양 · 1차 검증 · 요청 변환 (API 명세서 4-2, FRONT_ARCHITECTURE § 5-4).
//
// 폼 값 모양은 요청(ProjectRequest)과 같은 경로를 쓴다 — Spring fieldErrors 의 "team[0].name" · "period.end" 가
// 그대로 폼 필드에 붙는다 (apply-field-errors.ts). 다른 점은 빈 값 표현뿐이다:
//   폼: 비운 칸 = ""  (입력칸은 null 을 다룰 수 없다)     요청: 비운 값 = null (명세 1-4) → toProjectRequest 가 바꾼다
// 글자 수 · 개수 제한은 constants/limits.ts 에서만 가져온다.

import { z } from "zod";

import { HTTP_URL_PATTERN, PROJECT_LIMITS, SLUG_PATTERN } from "@/constants/limits";
import { isYearMonth } from "@/lib/date";
import { publicEnv } from "@/lib/env/client";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/types/api";
import type { ProjectRequest } from "@/types/request";

const L = PROJECT_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  maxItems: (max: number) => `최대 ${max}개까지 입력할 수 있습니다.`,
  emptyItem: "내용을 입력하거나 항목을 삭제해 주세요.",
  slugFormat: "영문 소문자 · 숫자 · 하이픈만 쓸 수 있습니다. (예: campus-map)",
  category: "유형을 선택해 주세요.",
  periodStart: "시작 연월을 선택해 주세요.",
  periodEnd: "종료 연월을 끝까지 선택하거나 '진행 중'으로 두세요.",
  periodOrder: "종료는 시작과 같은 달이거나 그 이후여야 합니다.",
  descriptionMin: "프로젝트 소개를 한 문단 이상 입력해 주세요.",
  duplicate: "중복된 항목이 있습니다.",
  url: "http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.",
  thumbnailUrl: "업로드한 썸네일 주소가 아닙니다.",
} as const;

/** 앞뒤 공백을 지운 뒤 검사한다 (명세 4장 도입부) */
const requiredText = (max: number) =>
  z.string().trim().min(1, MESSAGES.required).max(max, MESSAGES.maxLength(max));

const listItem = (max: number) =>
  z.string().trim().min(1, MESSAGES.emptyItem).max(max, MESSAGES.maxLength(max));

const optionalUrl = z
  .string()
  .trim()
  .max(L.url, MESSAGES.maxLength(L.url))
  .refine((value) => value === "" || HTTP_URL_PATTERN.test(value), MESSAGES.url);

function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

/** 썸네일은 R2 공개 주소의 projects/ 아래만 허용 (명세 4-2). 저장 시 Spring 이 실제 객체를 다시 확인한다 */
const thumbnailPrefix = `${publicEnv.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/projects/`;

export const projectFormSchema = z.object({
  title: requiredText(L.title),
  slug: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(L.slug, MESSAGES.maxLength(L.slug))
    .regex(SLUG_PATTERN, MESSAGES.slugFormat),
  summary: requiredText(L.summary),
  category: z
    .string()
    .refine(isProjectCategory, MESSAGES.category)
    .transform((value) => value as ProjectCategory),
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
  thumbnailUrl: z
    .string()
    .nullable()
    .refine((value) => value === null || value.startsWith(thumbnailPrefix), MESSAGES.thumbnailUrl),
  description: z
    .array(listItem(L.description.itemLength))
    .min(L.description.min, MESSAGES.descriptionMin)
    .max(L.description.max, MESSAGES.maxItems(L.description.max)),
  team: z
    .array(
      z.object({ name: requiredText(L.team.itemLength), role: requiredText(L.team.itemLength) }),
    )
    .max(L.team.max, MESSAGES.maxItems(L.team.max)),
  techStack: z
    .array(listItem(L.techStack.itemLength))
    .max(L.techStack.max, MESSAGES.maxItems(L.techStack.max))
    .refine((items) => new Set(items).size === items.length, MESSAGES.duplicate),
  features: z
    .array(listItem(L.features.itemLength))
    .max(L.features.max, MESSAGES.maxItems(L.features.max)),
  outcomes: z
    .array(listItem(L.outcomes.itemLength))
    .max(L.outcomes.max, MESSAGES.maxItems(L.outcomes.max)),
  links: z.object({ github: optionalUrl, demo: optionalUrl }),
});

/** 폼이 들고 있는 값 (입력 중 · 임시 저장본) */
export type ProjectFormValues = z.input<typeof projectFormSchema>;
/** 검증을 통과해 앞뒤 공백까지 정리된 값 */
export type ProjectFormOutput = z.output<typeof projectFormSchema>;

/** 등록 폼 초기값. 소개는 최소 1문단이라 빈 문단 하나로 시작한다 */
export function emptyProjectForm(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    summary: "",
    category: "",
    period: { start: "", end: "" },
    thumbnailUrl: null,
    description: [""],
    team: [],
    techStack: [],
    features: [],
    outcomes: [],
    links: { github: "", demo: "" },
  };
}

/** 수정 폼 초기값. 응답에서 생략된 선택 필드(명세 1-4)는 빈 칸으로 */
export function projectToForm(project: Project): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    category: project.category,
    period: { start: project.period.start, end: project.period.end ?? "" },
    thumbnailUrl: project.thumbnailUrl ?? null,
    description: project.description.length > 0 ? [...project.description] : [""],
    team: project.team.map(({ name, role }) => ({ name, role })),
    techStack: [...project.techStack],
    features: [...project.features],
    outcomes: [...project.outcomes],
    links: { github: project.links.github ?? "", demo: project.links.demo ?? "" },
  };
}

/** 요청 본문. 모든 필드를 보내고, 비운 값은 null · [] (명세 1-4) */
export function toProjectRequest(values: ProjectFormOutput): ProjectRequest {
  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    category: values.category,
    period: { start: values.period.start, end: values.period.end || null },
    thumbnailUrl: values.thumbnailUrl,
    description: values.description,
    team: values.team,
    techStack: values.techStack,
    features: values.features,
    outcomes: values.outcomes,
    links: { github: values.links.github || null, demo: values.links.demo || null },
  };
}
