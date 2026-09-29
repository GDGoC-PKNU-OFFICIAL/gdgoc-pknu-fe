// src/lib/split-by-status.ts
// 프로젝트 · 스터디를 현재 / 과거 섹션으로 나눈다 (PRD 3-4).
// status 는 서버가 period.end 로 계산해 내려주는 값이라 프론트는 다시 계산하지 않는다 (API 1-4).
// 두 도메인이 같이 쓰므로 features 가 아니라 lib 에 둔다 (features 간 import 금지, FRONT_ARCHITECTURE § 4).

import type { ContentStatus } from "@/types/api";

export interface StatusSplit<T> {
  current: T[];
  past: T[];
}

/** 입력 순서를 유지한다 (공개 API 는 period.start 최신순) */
export function splitByStatus<T extends { status: ContentStatus }>(
  items: readonly T[],
): StatusSplit<T> {
  const split: StatusSplit<T> = { current: [], past: [] };
  for (const item of items) split[item.status].push(item);
  return split;
}
