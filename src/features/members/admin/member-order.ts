// src/features/members/admin/member-order.ts
// A-41 멤버 표시 순서 조정. 순서 변경 API 는 한 구분(코어멤버 · 시니어)의 id 전체를 원하므로,
// 화면에 보이는 행만으로 요청을 만들지 않고 서버에서 그 구분의 멤버를 전부 다시 읽어 만든다
// — 페이지 경계에서 한 구분이 둘로 나뉘어도 요청이 400 이 되지 않는다. (일정의 event-order.ts 와 같은 방식)

import { getAdminMembers } from "@/lib/api/admin-api";
import type { AdminMember, MemberStatus } from "@/types/api";

/** 명세 1-6 목록 크기 최대값 */
const MAX_PAGE_SIZE = 200;

/** 한 페이지 안에서 구분별 위치 — 그 구분에서 몇 번째인지, 그 구분이 몇 명 보이는지 */
export interface StatusPosition {
  index: number;
  count: number;
}

/** 보이는 순서 그대로 구분별로 센다. 키는 멤버 id */
export function statusPositions(members: readonly AdminMember[]): Map<number, StatusPosition> {
  const byStatus = new Map<MemberStatus, AdminMember[]>();
  for (const member of members) {
    const list = byStatus.get(member.status) ?? [];
    list.push(member);
    byStatus.set(member.status, list);
  }
  const positions = new Map<number, StatusPosition>();
  for (const list of byStatus.values()) {
    list.forEach((member, index) => positions.set(member.id, { index, count: list.length }));
  }
  return positions;
}

/** 그 구분의 멤버 id 전체를 지금 순서대로 (서버 기본 정렬 = 구분 → 표시 순서) */
export async function loadStatusIds(status: MemberStatus, signal?: AbortSignal): Promise<number[]> {
  const ids: number[] = [];
  for (let page = 0; ; page++) {
    const result = await getAdminMembers({ status, page, size: MAX_PAGE_SIZE }, signal);
    ids.push(...result.items.map((member) => member.id));
    if (page + 1 >= result.totalPages) break;
  }
  return ids;
}

/** id 를 delta(-1 위로 · +1 아래로) 만큼 옮긴 새 배열. 옮길 수 없으면 null */
export function moveId(ids: readonly number[], id: number, delta: -1 | 1): number[] | null {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
