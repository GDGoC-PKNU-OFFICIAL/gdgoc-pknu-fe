// src/features/events/admin/event-list-query.ts
// A-31 목록의 검색 · 필터 · 정렬 · 페이지를 URL 쿼리로 둔다 — 새로고침 · 뒤로 가기에도 조건이 남는다.
// 쿼리 이름은 API 명세 2-6 과 같다 (q · category · year · page · sort). 잘못된 값은 버리고 서버 기본값을 쓴다.

import { EVENT_CATEGORIES, type EventCategory } from "@/types/api";
import type { EventListQuery } from "@/types/request";

export const EVENT_SORTS = [
  { value: "date,desc", label: "날짜 최신순" },
  { value: "date,asc", label: "날짜 오래된순" },
  { value: "title,asc", label: "제목순" },
  { value: "updatedAt,desc", label: "최근 수정순" },
] as const satisfies readonly { value: NonNullable<EventListQuery["sort"]>; label: string }[];

/** 명세 2-6 기본 정렬(같은 날짜는 sortOrder 순) — URL 에서는 생략한다 */
export const DEFAULT_EVENT_SORT = "date,desc";

type EventSort = (typeof EVENT_SORTS)[number]["value"];

/** 화면 상태 = URL 쿼리. 페이지 크기는 고정(ADMIN_LIST_PAGE_SIZE)이라 두지 않는다 */
export interface EventListState {
  q: string;
  category: EventCategory | "";
  year: number | null;
  page: number;
  sort: EventSort;
}

function oneOf<T extends string>(values: readonly T[], value: string | null): T | undefined {
  return values.find((v) => v === value);
}

export function parseEventListState(params: Pick<URLSearchParams, "get">): EventListState {
  const year = Number(params.get("year"));
  const page = Number(params.get("page"));
  return {
    q: params.get("q")?.trim() ?? "",
    category: oneOf(EVENT_CATEGORIES, params.get("category")) ?? "",
    year: Number.isInteger(year) && year >= 1000 && year <= 9999 ? year : null,
    page: Number.isInteger(page) && page > 0 ? page : 0,
    sort:
      oneOf(
        EVENT_SORTS.map((s) => s.value),
        params.get("sort"),
      ) ?? DEFAULT_EVENT_SORT,
  };
}

/** 기본값은 빼고 쿼리 문자열로 — "?category=seminar&page=1" */
export function toEventListSearch(state: EventListState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.year !== null) params.set("year", String(state.year));
  if (state.page > 0) params.set("page", String(state.page));
  if (state.sort !== DEFAULT_EVENT_SORT) params.set("sort", state.sort);
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** 화면 상태 → API 쿼리. 빈 값은 보내지 않는다 (서버 기본값) */
export function toEventListQuery(state: EventListState, size: number): EventListQuery {
  return {
    q: state.q || undefined,
    category: state.category || undefined,
    year: state.year ?? undefined,
    page: state.page,
    size,
    sort: state.sort,
  };
}

export function hasActiveFilters(state: EventListState): boolean {
  return Boolean(state.q || state.category || state.year !== null);
}

/**
 * 같은 날 순서 조정을 보여 줄지. 같은 날 일정이 목록에 빠짐없이 순서대로 보여야 의미가 있으므로
 * 검색 · 카테고리 필터가 없고 기본 정렬(날짜 → 순서)일 때만 켠다. 연도 필터는 날짜를 쪼개지 않아 괜찮다.
 */
export function canReorder(state: EventListState): boolean {
  return !state.q && !state.category && state.sort === DEFAULT_EVENT_SORT;
}
