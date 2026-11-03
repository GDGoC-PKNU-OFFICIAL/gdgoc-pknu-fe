// src/data/home.ts
// P-00 홈의 고정 문구 — 히어로 · 섹션 헤더(IA 10-2) · 페이지 안 이동 링크(IA 3-4).
// 빈 상태 문구는 각 페이지 데이터(projects · studies · events · members)와 같은 것을 쓴다 (IA 10-3).
//
// TODO(운영진): 히어로 카피는 초안이다. 확정 후 교체.

import { PUBLIC_ROUTES } from "@/constants/routes";

export const HERO = {
  title: "함께 배우고, 끝까지 만듭니다",
} as const;

export const HOME_SECTIONS = {
  stats: {
    badge: "활동 기록",
    title: "By the Numbers",
    caption: "부경대학교에서 매 학기 세션 · 스터디 · 프로젝트를 이어 가며 쌓아 온 기록입니다.",
  },
  about: {
    badge: "동아리 소개",
    title: "What We Do",
    link: { label: "활동 방식 자세히 보기", href: PUBLIC_ROUTES.about },
  },
  projects: {
    badge: "프로젝트",
    title: "Current Projects",
    link: { label: "전체 프로젝트 보기", href: PUBLIC_ROUTES.projects },
  },
  studies: {
    badge: "스터디",
    title: "Current Studies",
    subtitle: "관심 있는 분야를 함께 탐구하고, 서로의 지식과 경험을 나누며 성장합니다.",
    // 카드 아래 학습 문화 줄이 "전체 스터디 보기" 링크를 겸한다
    culture: {
      title: "함께하는 학습의 가치",
      description: "지식 공유부터 실습, 프로젝트까지 함께하는 성장의 여정",
      href: PUBLIC_ROUTES.studies,
      linkLabel: "전체 스터디 보기",
    },
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

/** 홈 진행 중 프로젝트 · 다가오는 일정 최대 개수 (IA 4장 P-00) */
export const HOME_LIST_LIMIT = 3;

/** 홈 진행 중 스터디는 큰 카드라 2개까지만 보여 준다. 나머지는 Studies 페이지에서 본다 */
export const HOME_STUDY_LIMIT = 2;
