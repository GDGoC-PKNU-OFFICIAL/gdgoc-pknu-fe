// src/features/studies/lib/study-labels.ts
// 스터디 화면 전용 표시 규칙. enum 코드값 → 라벨 자체는 constants/labels.ts(API 3-10)가 출처다.

import type { ContentStatus } from "@/types/api";

/** 관리자 폼의 진행 상태 표시 — 종료월로 자동 계산 (IA 8-4 A-22 · A-23) */
export const STUDY_STATUS_LABELS = {
  current: "진행 중",
  past: "완료",
} satisfies Record<ContentStatus, string>;
