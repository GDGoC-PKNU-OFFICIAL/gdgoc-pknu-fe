// src/features/members/lib/sort-members.ts
// 멤버 구분 · 정렬 (IA 5-4 카드 정렬). 공개 API 는 묶지 않고 주므로 프론트에서 처리한다 (API 2-1).
//   코어멤버: 역할 순(lead → part-lead → core) → 같은 역할은 최신순
//   시니어:   최신순
// 최신순 = 최근에 등록한 멤버부터 (createdAt 내림차순). 같은 시각이면 이름 가나다순.
// 팀 디자인 수정(2026-11)으로 이름순에서 바꿨다 — IA 5-4 는 이름순이다.

import { type CoreMember, type Member, MEMBER_ROLES, type SeniorMember } from "@/types/api";

function compareLatest(
  a: Pick<Member, "name" | "createdAt">,
  b: Pick<Member, "name" | "createdAt">,
): number {
  // ISO 8601 시각 문자열은 같은 시간대 표기면 글자 비교로 시간 순서가 맞다 — 다를 수 있어 Date 로 바꿔 비교한다
  return Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.name.localeCompare(b.name, "ko");
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
    (a, b) => MEMBER_ROLES.indexOf(a.role) - MEMBER_ROLES.indexOf(b.role) || compareLatest(a, b),
  );
  senior.sort(compareLatest);
  return { core, senior };
}
