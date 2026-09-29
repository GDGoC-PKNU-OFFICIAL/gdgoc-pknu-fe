// src/data/projects.ts
// P-02 Projects 의 고정 문구 — 페이지 헤더 · 섹션 헤더(IA 10-2) · 빈 상태(IA 10-3).
//
// TODO(운영진): 페이지 헤더 설명은 초안이다. 확정 후 교체.

export const PROJECTS_HEADER = {
  title: "Projects",
  description: "지금 만들고 있는 프로젝트와 지난 기수가 끝까지 만든 프로젝트를 소개합니다.",
} as const;

export const CURRENT_PROJECTS = {
  badge: "프로젝트",
  title: "Current Projects",
  empty: "진행 중인 프로젝트가 없습니다. 새 학기 프로젝트 팀이 꾸려지면 이곳에 올라옵니다.",
} as const;

export const PAST_PROJECTS = {
  badge: "프로젝트",
  title: "Past Projects",
  empty: "아직 완료된 프로젝트가 없습니다.",
} as const;
