// src/features/projects/admin/project-list-query.ts
// A-11 목록의 검색 · 필터 · 정렬 · 페이지를 URL 쿼리로 둔다 — 새로고침 · 뒤로 가기에도 조건이 남는다.
// 쿼리 이름은 API 명세 2-4 와 같다 (q · status · category · year · page · sort). 잘못된 값은 버리고 서버 기본값을 쓴다.

import {
  CONTENT_STATUSES,
  type ContentStatus,
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/types/api";
import type { ProjectListQuery } from "@/types/request";

export const PROJECT_SORTS = [
  { value: "periodStart,desc", label: "시작일 최신순" },
  { value: "periodStart,asc", label: "시작일 오래된순" },
  { value: "title,asc", label: "제목순" },
  { value: "updatedAt,desc", label: "최근 수정순" },
] as const satisfies readonly { value: NonNullable<ProjectListQuery["sort"]>; label: string }[];

/** 명세 2-4 기본 정렬 — URL 에서는 생략한다 */
export const DEFAULT_PROJECT_SORT = "periodStart,desc";

type ProjectSort = (typeof PROJECT_SORTS)[number]["value"];

/** 화면 상태 = URL 쿼리. 페이지 크기는 고정(ADMIN_LIST_PAGE_SIZE)이라 두지 않는다 */
export interface ProjectListState {
  q: string;
  status: ContentStatus | "";
  category: ProjectCategory | "";
  year: number | null;
  page: number;
  sort: ProjectSort;
}

function oneOf<T extends string>(values: readonly T[], value: string | null): T | undefined {
  return values.find((v) => v === value);
}

export function parseProjectListState(params: Pick<URLSearchParams, "get">): ProjectListState {
  const year = Number(params.get("year"));
  const page = Number(params.get("page"));
  return {
    q: params.get("q")?.trim() ?? "",
    status: oneOf(CONTENT_STATUSES, params.get("status")) ?? "",
    category: oneOf(PROJECT_CATEGORIES, params.get("category")) ?? "",
    year: Number.isInteger(year) && year >= 1000 && year <= 9999 ? year : null,
    page: Number.isInteger(page) && page > 0 ? page : 0,
    sort:
      oneOf(
        PROJECT_SORTS.map((s) => s.value),
        params.get("sort"),
      ) ?? DEFAULT_PROJECT_SORT,
  };
}

/** 기본값은 빼고 쿼리 문자열로 — "?status=past&page=1" */
export function toProjectListSearch(state: ProjectListState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status) params.set("status", state.status);
  if (state.category) params.set("category", state.category);
  if (state.year !== null) params.set("year", String(state.year));
  if (state.page > 0) params.set("page", String(state.page));
  if (state.sort !== DEFAULT_PROJECT_SORT) params.set("sort", state.sort);
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** 화면 상태 → API 쿼리. 빈 값은 보내지 않는다 (서버 기본값) */
export function toProjectListQuery(state: ProjectListState, size: number): ProjectListQuery {
  return {
    q: state.q || undefined,
    status: state.status || undefined,
    category: state.category || undefined,
    year: state.year ?? undefined,
    page: state.page,
    size,
    sort: state.sort,
  };
}

export function hasActiveFilters(state: ProjectListState): boolean {
  return Boolean(state.q || state.status || state.category || state.year !== null);
}
