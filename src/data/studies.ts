// src/data/studies.ts
// P-03 Studies 의 고정 문구 — 페이지 헤더 · 섹션 헤더(IA 10-2) · 빈 상태(IA 10-3).
//
// TODO(운영진): 페이지 헤더 설명은 초안이다. 확정 후 교체.

export const STUDIES_HEADER = {
  title: "Studies",
  description: "파트별로 모여 함께 공부하고, 결과물을 남긴 스터디를 소개합니다.",
} as const;

export const CURRENT_STUDIES = {
  badge: "스터디",
  title: "Current Studies",
  empty: "진행 중인 스터디가 없습니다. 새 학기 스터디가 열리면 이곳에 올라옵니다.",
} as const;

export const PAST_STUDIES = {
  badge: "스터디",
  title: "Past Studies",
  empty: "아직 완료된 스터디가 없습니다.",
} as const;
