// src/features/projects/lib/project-labels.ts
// 프로젝트 화면 전용 표시 규칙. enum 코드값 → 라벨 자체는 constants/labels.ts(API 3-10)가 출처다.

import { type BadgeTone } from "@/components/ui/Badge";
import type { ContentStatus, ProjectCategory } from "@/types/api";

/** 유형 태그 색 — 과거 프로젝트는 유형 필터가 없어 태그 색으로만 구분한다 (PRD 3-4) */
export const PROJECT_CATEGORY_TONES = {
  "solution-challenge": "blue",
  "team-project": "green",
  official: "red",
} satisfies Record<ProjectCategory, BadgeTone>;

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
