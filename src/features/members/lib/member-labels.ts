// src/features/members/lib/member-labels.ts
// 멤버 화면 전용 표시 규칙. 코드값 → 라벨은 constants/labels.ts(API 3-10)가 출처다.

import { type BadgeTone } from "@/components/ui/Badge";
import type { MemberRole } from "@/types/api";

/** 역할 배지 색 (코어멤버만, IA 5-5) */
export const MEMBER_ROLE_TONES = {
  lead: "red",
  "part-lead": "blue",
  core: "green",
} satisfies Record<MemberRole, BadgeTone>;

/** 기본 이미지 (C-11) — R2 가 아닌 정적 에셋이라 R2 장애 시에도 뜬다 (PRD 4-4) */
export const DEFAULT_MEMBER_IMAGE = "/images/default-member.png";
