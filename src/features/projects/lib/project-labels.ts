// src/features/projects/lib/project-labels.ts
// 프로젝트 화면 전용 표시 규칙. enum 코드값 → 라벨 자체는 constants/labels.ts(API 3-10)가 출처다.

import { type BadgeTone } from "@/components/ui/Badge";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import type { BadgeColor, ContentStatus, Project, ProjectCategory } from "@/types/api";

/** 배지 색 코드 → 배지 톤 (라이트 · 다크 색은 components/ui/Badge.tsx) */
export const BADGE_COLOR_TONES = {
  blue: "blue",
  green: "green",
  red: "red",
  yellow: "yellow",
  purple: "purple",
  gray: "neutral",
} satisfies Record<BadgeColor, BadgeTone>;

/** 관리자 폼 색 고르기 이름 */
export const BADGE_COLOR_LABELS = {
  blue: "파랑",
  green: "초록",
  red: "빨강",
  yellow: "노랑",
  purple: "보라",
  gray: "회색",
} satisfies Record<BadgeColor, string>;

/** 카테고리 기본 배지 색 — 직접 정한 배지가 없을 때. 과거 프로젝트는 유형 필터가 없어 배지 색으로 구분한다 (PRD 3-4) */
const CATEGORY_BADGE_COLORS = {
  "solution-challenge": "blue",
  "team-project": "green",
  official: "red",
} satisfies Record<ProjectCategory, BadgeColor>;

/** 새 배지를 만들 때 처음 골라 둘 색 — 지금 보이는 카테고리 색과 같게 */
export function defaultBadgeColor(category: ProjectCategory | ""): BadgeColor {
  return category === "" ? "blue" : CATEGORY_BADGE_COLORS[category];
}

/**
 * 화면에 보일 배지 (카드 · 상세 · 관리자 목록 공통).
 * 직접 정한 배지(badge)가 있으면 그 글자 · 색, 없으면 카테고리 라벨 · 색.
 */
export function projectBadge(project: Pick<Project, "category" | "badge">): {
  label: string;
  tone: BadgeTone;
} {
  if (project.badge) {
    return { label: project.badge.label, tone: BADGE_COLOR_TONES[project.badge.color] };
  }
  return {
    label: PROJECT_CATEGORY_LABELS[project.category],
    tone: BADGE_COLOR_TONES[CATEGORY_BADGE_COLORS[project.category]],
  };
}

/** 상세 카드 기본 정보의 상태 표시 (IA 4장 P-02-D #2) */
export const PROJECT_STATUS_LABELS = {
  current: "진행 중",
  past: "완료",
} satisfies Record<ContentStatus, string>;

/** outcomes 섹션 제목 — 진행 중이면 "목표" (IA 4장 P-02-D #7) */
export const PROJECT_OUTCOMES_TITLES = {
  current: "목표",
  past: "결과",
} satisfies Record<ContentStatus, string>;

/** 기본 이미지 (C-11) — R2 가 아닌 정적 에셋이라 R2 장애 시에도 뜬다 (PRD 4-4) */
export const DEFAULT_PROJECT_IMAGE = "/images/default-project.png";

/** 상세 카드가 커지는 애니메이션에서 카드 썸네일 ↔ 상세 썸네일을 잇는 view-transition-name */
export const PROJECT_THUMB_TRANSITION_NAME = "project-detail-thumb";
