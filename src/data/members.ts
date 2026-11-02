// src/data/members.ts
// P-05 Members 의 고정 문구 — 페이지 헤더 · 섹션 헤더(IA 10-2) · 빈 상태(IA 10-3).
//
// TODO(운영진): 페이지 헤더 설명은 초안이다. 확정 후 교체.

export const MEMBERS_HEADER = {
  title: "Members",
  description: "GDG on Campus PKNU를 이끄는 코어멤버와 활동을 마친 시니어를 소개합니다.",
} as const;

export const CORE_MEMBERS = {
  badge: "멤버",
  title: "Core Members",
  empty: "코어멤버 정보를 준비하고 있습니다.",
} as const;

export const SENIORS = {
  badge: "멤버",
  title: "Seniors",
  subtitle: "활동을 마친 멤버",
  empty: "아직 등록된 시니어가 없습니다.",
} as const;
