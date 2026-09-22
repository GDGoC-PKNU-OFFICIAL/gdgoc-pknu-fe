// src/constants/limits.ts
// API 명세서 4장(요청 Body 검증 규칙)의 글자 수 · 개수 제한과 형식 규칙을 한 곳에 모은 것.
// FRONT_ARCHITECTURE § 9: "글자 수 제한이 이 파일 한 곳에서만 나와야 한다"
// → CharCounter · zod 스키마 · placeholder 힌트가 모두 이 파일만 import 한다.
//
// 구조 규칙
// - 단일 문자열 필드: 숫자 (최대 글자 수)
// - 배열 필드:        { max, itemLength } (+ 필요하면 min) — 배열 입력 컴포넌트에 통째로 넘긴다
//   예) <TagInput limits={PROJECT_LIMITS.techStack} />
// - 키 이름은 요청 타입(types/request.ts)의 필드 이름과 맞춘다

// ============================================================
// 공통
// ============================================================

/** 모든 URL 필드 최대 길이 (DB varchar(500)) */
export const URL_MAX = 500;

/** 프로젝트 · 스터디 슬러그 형식 (4-2 · 4-3) */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 링크 필드 형식: http(s):// 로 시작 (4-2 · 4-3 · 4-6) */
export const HTTP_URL_PATTERN = /^https?:\/\/\S+$/;

// ============================================================
// 4-1 LoginRequest
// ============================================================

export const LOGIN_LIMITS = {
  loginId: 40,
} as const;

// ============================================================
// 4-2 ProjectRequest
// ============================================================

export const PROJECT_LIMITS = {
  title: 40,
  slug: 60,
  summary: 80,
  description: { min: 1, max: 10, itemLength: 1000 }, // 문단
  team: { max: 20, itemLength: 20 }, // itemLength = name · role 각각
  techStack: { max: 10, itemLength: 20 }, // 중복 불가
  features: { max: 10, itemLength: 80 },
  outcomes: { max: 10, itemLength: 80 },
  url: URL_MAX, // links.github · links.demo
} as const;

// ============================================================
// 4-3 StudyRequest
// ============================================================

export const STUDY_LIMITS = {
  title: 40,
  slug: 60,
  summary: 80,
  topic: 20,
  leader: 20,
  participants: { max: 30, itemLength: 20 }, // 리더 제외
  format: 30,
  outputs: { max: 5, labelLength: 30, url: URL_MAX }, // label · url 모두 필수
} as const;

// ============================================================
// 4-4 EventRequest
// ============================================================

export const EVENT_LIMITS = {
  title: 40,
  time: 20,
  place: 40,
  summary: 80,
} as const;

// ============================================================
// 4-6 MemberRequest (= PRD 4-2-1 플립 카드 입력 폼)
// ============================================================

export const MEMBER_LIMITS = {
  name: 20,
  department: 30,
  history: { max: 2, itemLength: 40 }, // 입력폼 자체가 3개째 추가를 막는다 (PRD 4-2-1)
  interests: { max: 3, itemLength: 15 }, // 중복 불가
  bio: 60,
  url: URL_MAX, // links.github · links.homepage
} as const;

// ============================================================
// 4-7 SettingRequest
// ============================================================

export const SETTING_LIMITS = {
  bannerText: 60,
  stats: {
    count: 4, // 정확히 4개
    labelLength: 20,
    unitLength: 10,
    suffixLength: 5,
    minValue: 0, // 0 이상 정수
  },
} as const;

// ============================================================
// 4-8 PresignRequest / PRD 4-4 이미지 업로드
// ============================================================
// 허용 형식은 types/api.ts 의 IMAGE_CONTENT_TYPES 를 쓴다.
// Presigned URL 유효 시간은 서버가 정하므로 상수로 두지 않는다 — 응답의 expiresAt 을 쓴다.

export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB = 5,242,880 bytes
} as const;
