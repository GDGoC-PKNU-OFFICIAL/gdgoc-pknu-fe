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
 * 관리자 경로 (PRD 4-1). 등록 폼(/new)은 해당 화면을 만들 때 추가한다.
 * 수정 폼은 id 가 들어가므로 상수가 아니라 `${목록 경로}/${id}/${ADMIN_EDIT_SEGMENT}` 로 만든다.
 * proxy.ts 의 matcher 는 빌드 때 정적으로 읽히므로 이 상수를 쓰지 못하고 리터럴을 쓴다.
 */
export const ADMIN_ROUTES = {
  dashboard: "/admin",
  login: "/admin/login",
  projects: "/admin/projects",
  projectsNew: "/admin/projects/new",
  studies: "/admin/studies",
  events: "/admin/events",
  members: "/admin/members",
  settings: "/admin/settings",
} as const;

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];

/** 수정 폼 경로의 마지막 세그먼트 — /admin/projects/{id}/edit (IA 1-2) */
export const ADMIN_EDIT_SEGMENT = "edit";

/**
 * 관리자 사이드바 메뉴 (IA 8-1). 배열 순서 = 화면 순서 = 공개 GNB 순서 (PRD 4-1).
 * 대시보드는 하위 경로가 전부 /admin/... 이라 정확히 일치할 때만 활성으로 본다 (exact).
 */
export const ADMIN_NAV_ITEMS = [
  { label: "대시보드", href: ADMIN_ROUTES.dashboard, exact: true },
  { label: "프로젝트", href: ADMIN_ROUTES.projects, exact: false },
  { label: "스터디", href: ADMIN_ROUTES.studies, exact: false },
  { label: "일정", href: ADMIN_ROUTES.events, exact: false },
  { label: "멤버", href: ADMIN_ROUTES.members, exact: false },
  { label: "사이트 설정", href: ADMIN_ROUTES.settings, exact: false },
] as const satisfies readonly { label: string; href: AdminRoute; exact: boolean }[];

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
