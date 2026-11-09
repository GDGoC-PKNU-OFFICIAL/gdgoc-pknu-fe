// src/features/members/admin/member-list-query.ts
// A-41 목록의 검색 · 필터 · 정렬 · 페이지를 URL 쿼리로 둔다 — 새로고침 · 뒤로 가기에도 조건이 남는다.
// 쿼리 이름은 API 명세 2-7 과 같다 (q · status · role · page · sort). 연도 필터는 없다.
// 기본 정렬(구분 → 역할 순 → 이름)은 sort 로 표현할 수 없어 sort 를 보내지 않는 것으로 나타낸다.

import { MEMBER_ROLES, MEMBER_STATUSES, type MemberRole, type MemberStatus } from "@/types/api";
import type { MemberListQuery } from "@/types/request";

/** value "" = 서버 기본 정렬 (sort 를 보내지 않음) */
export const MEMBER_SORTS = [
  { value: "", label: "기본 순서 (구분 · 역할 · 이름)" },
  { value: "name,asc", label: "이름순" },
  { value: "updatedAt,desc", label: "최근 수정순" },
] as const satisfies readonly { value: NonNullable<MemberListQuery["sort"]> | ""; label: string }[];

type MemberSort = (typeof MEMBER_SORTS)[number]["value"];

/** 화면 상태 = URL 쿼리. 페이지 크기는 고정(ADMIN_LIST_PAGE_SIZE)이라 두지 않는다 */
export interface MemberListState {
  q: string;
  status: MemberStatus | "";
  role: MemberRole | "";
  page: number;
  sort: MemberSort;
}

function oneOf<T extends string>(values: readonly T[], value: string | null): T | undefined {
  return values.find((v) => v === value);
}

export function parseMemberListState(params: Pick<URLSearchParams, "get">): MemberListState {
  const page = Number(params.get("page"));
  return {
    q: params.get("q")?.trim() ?? "",
    status: oneOf(MEMBER_STATUSES, params.get("status")) ?? "",
    role: oneOf(MEMBER_ROLES, params.get("role")) ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 0,
    sort:
      oneOf(
        MEMBER_SORTS.map((s) => s.value),
        params.get("sort"),
      ) ?? "",
  };
}

/** 기본값은 빼고 쿼리 문자열로 — "?status=senior&page=1" */
export function toMemberListSearch(state: MemberListState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status) params.set("status", state.status);
  if (state.role) params.set("role", state.role);
  if (state.page > 0) params.set("page", String(state.page));
  if (state.sort) params.set("sort", state.sort);
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** 화면 상태 → API 쿼리. 빈 값은 보내지 않는다 (서버 기본값) */
export function toMemberListQuery(state: MemberListState, size: number): MemberListQuery {
  return {
    q: state.q || undefined,
    status: state.status || undefined,
    role: state.role || undefined,
    page: state.page,
    size,
    sort: state.sort || undefined,
  };
}

export function hasActiveFilters(state: MemberListState): boolean {
  return Boolean(state.q || state.status || state.role);
}
