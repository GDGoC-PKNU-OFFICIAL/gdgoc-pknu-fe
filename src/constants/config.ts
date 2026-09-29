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
