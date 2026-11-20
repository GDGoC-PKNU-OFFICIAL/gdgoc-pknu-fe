// src/lib/group-by-year.ts
// 연도 버튼 + 슬라이드 공용 묶기 (과거 프로젝트 · 과거 스터디, PRD 3-3-A).
// - 버튼 순서: 오래된 → 최신, 기본 선택: 데이터가 있는 가장 최근 연도
// - 데이터가 있는 연도만 만든다
//
// Map 대신 배열을 돌려준다: 순서가 명확하고, 서버 → 클라이언트 props 로 그대로 넘길 수 있다.

export interface YearGroup<T> {
  year: number;
  items: T[];
}

/**
 * 연도별로 묶어 "오래된 연도 → 최신 연도" 순으로 돌려준다.
 * 같은 연도 안의 순서는 입력 순서를 유지한다 (공개 API 는 period.start 최신순).
 */
export function groupByYear<T>(items: readonly T[], getYear: (item: T) => number): YearGroup<T>[] {
  const buckets = new Map<number, T[]>();
  for (const item of items) {
    const year = getYear(item);
    const bucket = buckets.get(year);
    if (bucket) bucket.push(item);
    else buckets.set(year, [item]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, groupItems]) => ({ year, items: groupItems }));
}

/** 기본 선택 연도 = 가장 최근 연도. 데이터가 없으면 null (→ 연도 버튼 숨김 + 빈 상태, PRD 3-3-A) */
export function latestYear(groups: readonly YearGroup<unknown>[]): number | null {
  return groups.length > 0 ? groups[groups.length - 1].year : null;
}

/**
 * URL 의 ?pastYear= 값을 실제 선택 연도로 바꾼다.
 * 숫자가 아니거나 데이터가 없는 연도면 최신 연도로 대체한다 (잘못된 공유 링크 방어).
 */
export function resolveSelectedYear(
  groups: readonly YearGroup<unknown>[],
  pastYearParam: string | null,
): number | null {
  const requested = pastYearParam === null ? Number.NaN : Number(pastYearParam);
  return groups.some((g) => g.year === requested) ? requested : latestYear(groups);
}
