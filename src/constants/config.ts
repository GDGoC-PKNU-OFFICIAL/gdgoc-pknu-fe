// src/constants/config.ts
// 동작 설정값 (FRONT_ARCHITECTURE § 3). 글자 수 · 개수 제한은 limits.ts 에 둔다.

/**
 * 공개 페이지 ISR 주기 = 30분 (PRD 1장 "Render 콜드 스타트 대응" 1번).
 * lib/api/public-api.ts 의 fetch `next.revalidate` 에 쓴다.
 *
 * ⚠️ page.tsx 의 `export const revalidate` 에는 이 상수를 쓸 수 없다.
 *    Next 가 빌드 때 값을 정적으로 읽기 때문에 리터럴(1800)만 허용한다 — 바꿀 때 함께 고친다.
 */
export const REVALIDATE_SECONDS = 1800;

/**
 * 공개 API 요청 타임아웃. Render 무료 티어 콜드 스타트 최대 30초 + 여유 5초 (FRONT_ARCHITECTURE § 5-1).
 * 이 시간을 넘기면 요청을 끊고 에러를 던진다 → ISR 재생성이면 기존 페이지가 유지된다.
 */
export const PUBLIC_API_TIMEOUT_MS = 35_000;

/**
 * BFF(app/api/admin/**) → Spring 요청 타임아웃. 관리자도 콜드 스타트를 직접 겪으므로 공개 API 와 같은 기준이다.
 * 관리자 화면은 그동안 "서버를 깨우는 중입니다. 최대 30초 걸릴 수 있습니다." 를 보여 준다 (IA 8-5).
 */
export const ADMIN_API_TIMEOUT_MS = 35_000;

/**
 * 관리자 요청이 이 시간을 넘기면 Render 콜드 스타트로 보고 "서버를 깨우는 중" 안내를 띄운다 (IA 8-5).
 * 로그인 · 목록 진입 · 저장에 같은 기준을 쓴다.
 */
export const ADMIN_SLOW_NOTICE_MS = 3_000;

/** 관리자 목록 한 페이지 크기 = 명세 1-6 의 서버 기본값 */
export const ADMIN_LIST_PAGE_SIZE = 20;

/** 관리자 연도 필터 · 연월 선택의 첫 해. 마지막 해는 올해 + 1 (진행 중 프로젝트의 종료 예정월) */
export const ADMIN_YEAR_RANGE_START = 2020;

/** 폼 임시 저장 — 마지막 입력 후 이 시간이 지나면 저장한다 (PRD 4-6 · IA 8-6) */
export const DRAFT_SAVE_DELAY_MS = 1_000;

/** 폼 임시 저장본 보관 기간 7일 (PRD 4-6 · IA 8-6). 지나면 읽을 때 지운다 */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 슬러그 중복 확인 — 입력이 멈춘 뒤 이 시간이 지나면 서버에 묻는다 (A-12 · A-13) */
export const SLUG_CHECK_DELAY_MS = 400;
