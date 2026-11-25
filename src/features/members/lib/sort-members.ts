// src/features/members/lib/sort-members.ts
// 멤버 구분 · 정렬 (IA 5-4 카드 정렬). 공개 API 는 구분별로 묶지 않고 주므로 프론트에서 나눈다 (API 2-1).
// 순서는 관리자가 정한 표시 순서(sortOrder)다 — 관리자 멤버 목록의 ↑↓ 로 바꾼다.
// 역할(리드 · 파트 리드 · 코어)로 세우던 순서는 2026-11 에 이것으로 바꿨다.

import type { CoreMember, Member, SeniorMember } from "@/types/api";

/** 표시 순서 → 같으면 먼저 등록한 멤버(id) — 서버 기본 정렬과 같다 */
function compareOrder(a: Member, b: Member): number {
  return a.sortOrder - b.sortOrder || a.id - b.id;
}

export interface MemberGroups {
  core: CoreMember[];
  senior: SeniorMember[];
}

/** 입력 배열은 바꾸지 않는다 */
export function groupMembers(members: readonly Member[]): MemberGroups {
  const core: CoreMember[] = [];
  const senior: SeniorMember[] = [];
  for (const member of members) {
    if (member.status === "core") core.push(member);
    else senior.push(member);
  }
  core.sort(compareOrder);
  senior.sort(compareOrder);
  return { core, senior };
}
