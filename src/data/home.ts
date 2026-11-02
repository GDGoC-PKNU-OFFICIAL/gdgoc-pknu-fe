// src/data/home.ts
// P-00 홈의 고정 문구 — 히어로 · 섹션 헤더(IA 10-2) · 페이지 안 이동 링크(IA 3-4).
// 빈 상태 문구는 각 페이지 데이터(projects · studies · events · members)와 같은 것을 쓴다 (IA 10-3).
//
// TODO(운영진): 히어로 카피는 초안이다. 확정 후 교체.

import { PUBLIC_ROUTES } from "@/constants/routes";

export const HERO = {
  title: "함께 배우고, 끝까지 만듭니다",
  primaryCta: { label: "프로젝트 보기", href: PUBLIC_ROUTES.projects },
  secondaryCta: { label: "동아리 소개", href: PUBLIC_ROUTES.about },
} as const;

export const HOME_SECTIONS = {
  stats: { badge: "활동 기록", title: "By the Numbers" },
  about: {
    badge: "동아리 소개",
    title: "What We Do",
    link: { label: "활동 방식 자세히 보기", href: PUBLIC_ROUTES.about },
  },
  projects: {
    badge: "프로젝트",
    title: "Current Projects",
    link: { label: "과거 프로젝트까지 보기", href: PUBLIC_ROUTES.projects },
  },
  studies: {
    badge: "스터디",
    title: "Current Studies",
    link: { label: "전체 스터디 보기", href: PUBLIC_ROUTES.studies },
  },
  events: {
    badge: "일정",
    title: "Upcoming Events",
    link: { label: "캘린더에서 보기", href: PUBLIC_ROUTES.events },
  },
  members: {
    badge: "코어멤버",
    title: "Core Members",
    link: { label: "코어멤버 · 시니어 전체 보기", href: PUBLIC_ROUTES.members },
  },
} as const;

/** 홈 진행 중 프로젝트 · 스터디 · 다가오는 일정 최대 개수 (IA 4장 P-00) */
export const HOME_LIST_LIMIT = 3;
