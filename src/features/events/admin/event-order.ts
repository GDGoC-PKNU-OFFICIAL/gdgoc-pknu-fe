// src/features/events/admin/event-order.ts
// A-31 같은 날 일정 순서 조정 (IA 8-3). 순서 변경 API 는 그 날짜의 id 전체를 원하므로(명세 4-5),
// 화면에 보이는 행만으로 요청을 만들지 않고 서버에서 그 날짜의 일정을 전부 다시 읽어 만든다
// — 페이지 경계에서 같은 날 일정이 둘로 나뉘어도 요청이 400 이 되지 않는다.

import { getAdminEvents } from "@/lib/api/admin-api";
import type { EventItem, IsoDate } from "@/types/api";

/** 명세 1-6 목록 크기 최대값 */
const MAX_PAGE_SIZE = 200;

/** 한 페이지 안에서 날짜별 위치 — 같은 날 몇 번째인지, 그 날 일정이 몇 건 보이는지 */
export interface DayPosition {
  index: number;
  count: number;
}

/** 보이는 순서 그대로 날짜별로 센다. 키는 일정 id */
export function dayPositions(events: readonly EventItem[]): Map<number, DayPosition> {
  const byDate = new Map<IsoDate, EventItem[]>();
  for (const event of events) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }
  const positions = new Map<number, DayPosition>();
  for (const list of byDate.values()) {
    list.forEach((event, index) => positions.set(event.id, { index, count: list.length }));
  }
  return positions;
}

/** 그 날짜의 일정 id 전체를 현재 순서대로. 연도 필터로 좁혀 읽는다 (명세 2-6 year = date 연도) */
export async function loadDayIds(date: IsoDate, signal?: AbortSignal): Promise<number[]> {
  const year = Number(date.slice(0, 4));
  const ids: { id: number; sortOrder: number }[] = [];
  for (let page = 0; ; page++) {
    const result = await getAdminEvents({ year, page, size: MAX_PAGE_SIZE }, signal);
    for (const event of result.items) {
      if (event.date === date) ids.push({ id: event.id, sortOrder: event.sortOrder });
    }
    if (page + 1 >= result.totalPages) break;
  }
  return ids.sort((a, b) => a.sortOrder - b.sortOrder).map(({ id }) => id);
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
