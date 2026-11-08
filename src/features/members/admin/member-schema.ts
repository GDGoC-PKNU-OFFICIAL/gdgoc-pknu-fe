// src/features/members/admin/member-schema.ts
// 멤버 등록 · 수정 폼 (A-42 · A-43) 의 값 모양 · 1차 검증 · 요청 변환 (API 명세서 4-6, FRONT_ARCHITECTURE § 5-4).
//
// 폼 값은 평평하게 둔다 — 구분을 바꿔도 역할 칸 값이 남아 있어야 다시 코어멤버로 돌렸을 때 복원된다.
// "시니어면 role 은 null" 규칙은 toMemberRequest 의 반환 타입(MemberRequest 판별 유니온)이 강제한다.
// 비운 칸은 폼에서 "", 요청에서 null 이다 (명세 1-4). 글자 수 · 개수 제한은 constants/limits.ts 에서만 가져온다.

import { z } from "zod";

import { HTTP_URL_PATTERN, MEMBER_LIMITS } from "@/constants/limits";
import { publicEnv } from "@/lib/env/client";
import {
  type AdminMember,
  MEMBER_PARTS,
  MEMBER_ROLES,
  MEMBER_STATUSES,
  type MemberPart,
  type MemberRole,
} from "@/types/api";
import type { MemberRequest } from "@/types/request";

const L = MEMBER_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  maxItems: (max: number) => `최대 ${max}개까지 입력할 수 있습니다.`,
  emptyItem: "내용을 입력하거나 항목을 삭제해 주세요.",
  duplicate: "중복된 항목이 있습니다.",
  role: "역할을 선택해 주세요.",
  part: "분야를 선택해 주세요.",
  url: "http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.",
  photoUrl: "업로드한 프로필 사진 주소가 아닙니다.",
  // IA 8-5
  consent: "본인 공개 동의를 확인해 주세요.",
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

function oneOf<T extends string>(values: readonly T[]) {
  return (value: string): value is T => (values as readonly string[]).includes(value);
}

const isMemberRole = oneOf(MEMBER_ROLES);
const isMemberPart = oneOf(MEMBER_PARTS);

/** 프로필 사진은 R2 공개 주소의 members/ 아래만 허용 (명세 4-6). 저장 시 Spring 이 실제 객체를 다시 확인한다 */
const photoPrefix = `${publicEnv.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/members/`;

export const memberFormSchema = z
  .object({
    status: z.enum(MEMBER_STATUSES),
    /** 코어멤버일 때만 검사한다 (아래 superRefine) */
    role: z.string(),
    photoUrl: z
      .string()
      .nullable()
      .refine((value) => value === null || value.startsWith(photoPrefix), MESSAGES.photoUrl),
    name: requiredText(L.name),
    department: requiredText(L.department),
    history: z
      .array(listItem(L.history.itemLength))
      .max(L.history.max, MESSAGES.maxItems(L.history.max)),
    interests: z
      .array(listItem(L.interests.itemLength))
      .max(L.interests.max, MESSAGES.maxItems(L.interests.max))
      .refine((items) => new Set(items).size === items.length, MESSAGES.duplicate),
    part: z
      .string()
      .refine(isMemberPart, MESSAGES.part)
      .transform((value) => value as MemberPart),
    bio: requiredText(L.bio),
    links: z.object({ github: optionalUrl, homepage: optionalUrl }),
    consentConfirmed: z.boolean().refine((value) => value, MESSAGES.consent),
  })
  .superRefine(({ status, role }, ctx) => {
    if (status === "core" && !isMemberRole(role)) {
      ctx.addIssue({ code: "custom", path: ["role"], message: MESSAGES.role });
    }
  });

/** 폼이 들고 있는 값 (입력 중 · 임시 저장본) */
export type MemberFormValues = z.input<typeof memberFormSchema>;
/** 검증을 통과해 앞뒤 공백까지 정리된 값 */
export type MemberFormOutput = z.output<typeof memberFormSchema>;

/** 등록 폼 초기값. 공개 동의는 매번 직접 체크해야 한다 */
export function emptyMemberForm(): MemberFormValues {
  return {
    status: "core",
    role: "",
    photoUrl: null,
    name: "",
    department: "",
    history: [],
    interests: [],
    part: "",
    bio: "",
    links: { github: "", homepage: "" },
    consentConfirmed: false,
  };
}

/**
 * 수정 폼 초기값. 응답에서 생략된 선택 필드(명세 1-4)는 빈 칸으로.
 * 공개 동의는 이미 확인된 멤버라 체크된 상태로 시작한다 — 서버는 최초 확인 일시를 유지한다 (명세 2-7).
 */
export function memberToForm(member: AdminMember): MemberFormValues {
  return {
    status: member.status,
    role: member.status === "core" ? member.role : "",
    photoUrl: member.photoUrl ?? null,
    name: member.name,
    department: member.department,
    history: [...member.history],
    interests: [...member.interests],
    part: member.part,
    bio: member.bio,
    links: { github: member.links.github ?? "", homepage: member.links.homepage ?? "" },
    consentConfirmed: true,
  };
}

/** 요청 본문. 모든 필드를 보내고, 비운 값은 null · [] (명세 1-4). 시니어면 role 은 null */
export function toMemberRequest(values: MemberFormOutput): MemberRequest {
  const base = {
    photoUrl: values.photoUrl,
    name: values.name,
    department: values.department,
    history: values.history,
    interests: values.interests,
    part: values.part,
    bio: values.bio,
    links: { github: values.links.github || null, homepage: values.links.homepage || null },
    consentConfirmed: values.consentConfirmed,
  };
  return values.status === "core"
    ? { ...base, status: "core", role: values.role as MemberRole }
    : { ...base, status: "senior", role: null };
}
