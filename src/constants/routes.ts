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

/**
 * 관리자 경로 (PRD 4-1). 도메인별 목록 · 폼 경로는 해당 화면을 만들 때 추가한다.
 * proxy.ts 의 matcher 는 빌드 때 정적으로 읽히므로 이 상수를 쓰지 못하고 리터럴을 쓴다.
 */
export const ADMIN_ROUTES = {
  dashboard: "/admin",
  login: "/admin/login",
} as const;

/** 로그인 후 돌아갈 경로를 담는 쿼리 키 — /admin/login?next=/admin/projects (IA 8-2) */
export const ADMIN_NEXT_PARAM = "next";

/**
 * 로그인 화면으로 보낸 이유 — /admin/login?reason=expired (IA 6-1 · 8-5).
 * 만료일 때만 붙인다. 로그인 폼이 "로그인이 만료되었습니다. 다시 로그인해 주세요." 를 보여 준다.
 */
export const ADMIN_REASON_PARAM = "reason";
export const ADMIN_REASON_EXPIRED = "expired";

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
