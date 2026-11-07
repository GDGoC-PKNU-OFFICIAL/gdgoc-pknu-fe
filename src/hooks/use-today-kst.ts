// src/hooks/use-today-kst.ts
// 브라우저 기준 오늘(KST). 공개 페이지는 ISR 로 만들어져 HTML 의 "오늘"이 오래되었을 수 있으므로 브라우저에서 다시 계산한다.
// 서버 렌더 · hydration 중에는 serverToday 를 써서 HTML 과 어긋나지 않게 하고, 그 직후 실제 오늘로 바꾼다 (lib/date.ts 주의문).

import { useSyncExternalStore } from "react";

import { todayKst } from "@/lib/date";
import type { IsoDate } from "@/types/api";

const subscribeNothing = () => () => {};

export function useTodayKst(serverToday: IsoDate): IsoDate {
  return useSyncExternalStore(subscribeNothing, todayKst, () => serverToday);
}
