// src/lib/revalidate-map.ts
// 관리자 쓰기 요청 → 재검증할 공개 경로 (API 명세서 7장 그대로, FRONT_ARCHITECTURE § 5-2).
// 매핑을 데이터로 두어 BFF 프록시는 "성공하면 이 표를 따른다"만 안다. 도메인이 늘면 이 표만 고친다.

import type { RevalidatablePath } from "@/types/api";

/** 관리자 API 첫 경로 세그먼트 → 공개 경로. uploads(presign)는 폼 저장 때 반영되므로 없다 */
const REVALIDATE_MAP: Readonly<Record<string, readonly RevalidatablePath[]>> = {
  projects: ["/", "/projects"],
  studies: ["/", "/studies"],
  events: ["/", "/events"], // 같은 날 순서 변경(PUT /events/order) 포함
  members: ["/", "/members"],
  settings: ["/"],
};

/** 재검증 대상인 쓰기 메서드. GET(목록 · 단건 · slug-check · dashboard)은 공개 페이지를 바꾸지 않는다 */
const WRITE_METHODS = new Set(["POST", "PUT", "DELETE"]);

/**
 * 성공한 관리자 요청이 재검증할 공개 경로. 해당 없으면 빈 배열.
 * Object.hasOwn 으로 찾는다 — segments[0] 이 "constructor" 같은 값이면 프로토타입 속성을 꺼내기 때문이다.
 */
export function pathsToRevalidate(
  method: string,
  segments: readonly string[],
): readonly RevalidatablePath[] {
  const [resource] = segments;
  if (!WRITE_METHODS.has(method) || resource === undefined) return [];
  return Object.hasOwn(REVALIDATE_MAP, resource) ? REVALIDATE_MAP[resource] : [];
}
