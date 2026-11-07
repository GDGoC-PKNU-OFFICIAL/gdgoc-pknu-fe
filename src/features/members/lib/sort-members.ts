// src/features/members/lib/sort-members.ts
// 멤버 구분 · 정렬 (IA 5-4 카드 정렬). 공개 API 는 묶지 않고 주므로 프론트에서 처리한다 (API 2-1).
//   코어멤버: 역할 순(lead → part-lead → core) → 이름 가나다순
//   시니어:   이름 가나다순

import { type CoreMember, type Member, MEMBER_ROLES, type SeniorMember } from "@/types/api";

function compareNames(a: Pick<Member, "name">, b: Pick<Member, "name">): number {
  return a.name.localeCompare(b.name, "ko");
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
  core.sort(
    (a, b) => MEMBER_ROLES.indexOf(a.role) - MEMBER_ROLES.indexOf(b.role) || compareNames(a, b),
  );
  senior.sort(compareNames);
  return { core, senior };
}
