// src/constants/labels.ts
// API 명세서 3-10 "enum 코드값 ↔ 화면 라벨" + 관리자 화면용 라벨.
// 모든 매핑에 `satisfies Record<…, string>` 을 붙여, types/api.ts 의 코드값 배열과 짝이 맞는지
// 컴파일 타임에 검사한다 (코드값을 추가하고 라벨을 빠뜨리거나, 없는 키를 넣으면 타입 에러).
//
// - 정렬 순서의 출처는 이 파일이 아니라 types/api.ts 의 배열이다.
//   객체 키 순서에 정렬을 의존하지 않는다.
// - components/ui 는 이 파일을 import 할 수 없다 (FRONT_ARCHITECTURE § 4). 라벨은 호출하는 쪽에서 문자열로 넘긴다.

import type {
  AdminResource,
  ContentStatus,
  EventCategory,
  MemberStatus,
  ProjectCategory,
} from "@/types/api";

// ============================================================
// 3-10 공개 화면 라벨
// ============================================================

export const PROJECT_CATEGORY_LABELS = {
  "solution-challenge": "Solution Challenge",
  "team-project": "Team Project",
  official: "Official",
} satisfies Record<ProjectCategory, string>;

export const EVENT_CATEGORY_LABELS = {
  // seminar · presentation 은 화면에서 meeting · project 로 합쳐 보인다 (types/api.ts EVENT_CATEGORY_CHOICES)
  meeting: "정기 세션",
  seminar: "정기 세션",
  project: "프로젝트",
  study: "스터디",
  festival: "GDG 행사",
  presentation: "프로젝트",
  milestone: "동아리 일정",
} satisfies Record<EventCategory, string>;

/** 공개 Members 섹션 제목 · 관리자 구분 필터 공용 — 문구 출처를 하나로 둔다 */
export const MEMBER_STATUS_LABELS = {
  core: "코어멤버",
  senior: "시니어",
} satisfies Record<MemberStatus, string>;

// ============================================================
// 관리자 화면 라벨
// ============================================================

/**
 * 관리자 목록 필터 · 배지 (A-11 · A-21).
 * 공개 페이지의 섹션 제목(Current Projects / Past Projects 등)은 영문 고정 문구라 여기서 가져오지 않는다.
 */
export const CONTENT_STATUS_LABELS = {
  current: "현재",
  past: "과거",
} satisfies Record<ContentStatus, string>;

/** 관리자 사이드바 · 대시보드 recentUpdates · 삭제 확인 모달 문구. 화면 용어는 IA 10-1 을 따른다 */
export const ADMIN_RESOURCE_LABELS = {
  projects: "프로젝트",
  studies: "스터디",
  events: "일정",
  members: "멤버",
} satisfies Record<AdminResource, string>;
