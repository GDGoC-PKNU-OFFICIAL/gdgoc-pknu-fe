// src/constants/routes.ts
// 공개 · 관리자 경로 상수 (FRONT_ARCHITECTURE § 3). 문자열 경로를 컴포넌트마다 흩뿌리지 않는다.

export const PUBLIC_ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  studies: "/studies",
  events: "/events",
  members: "/members",
  privacy: "/privacy",
} as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];

/** About 의 동아리 강령 앵커 — 홈 약속 섹션 "동아리 강령 전체 보기" 링크 대상 (IA 3-4) */
export const CODE_OF_CONDUCT_ID = "code-of-conduct";

/**
 * GNB (IA 3-2). 배열 순서 = 화면 순서. 라벨은 영문 고정 문구다.
 * 개인정보처리방침은 GNB 에 두지 않는다 (Footer 하단 바).
 */
export const GNB_ITEMS = [
  { label: "About", href: PUBLIC_ROUTES.about },
  { label: "Projects", href: PUBLIC_ROUTES.projects },
  { label: "Studies", href: PUBLIC_ROUTES.studies },
  { label: "Events", href: PUBLIC_ROUTES.events },
  { label: "Members", href: PUBLIC_ROUTES.members },
] as const satisfies readonly { label: string; href: PublicRoute }[];
