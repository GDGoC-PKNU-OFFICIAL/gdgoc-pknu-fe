// src/lib/api/http.ts
// fetch 래퍼: 타임아웃 · 에러 정규화 · JSON 해석 (FRONT_ARCHITECTURE § 3).
// 서버(public-api.ts)와 브라우저(admin-api.ts, Phase 4) 양쪽에서 쓰므로 "server-only" 를 넣지 않는다.
//
// 실패는 모두 ApiError 로 던진다 — 빈 값으로 흘려보내지 않는다.
// 공개 페이지 ISR 재생성 중 예외가 나면 Next 가 기존 페이지를 계속 제공하기 때문이다 (§ 5-1, PRD 1장 4번).

import { ApiError } from "./api-error";

export interface RequestJsonInit extends RequestInit {
  /** 이 시간(ms)이 지나면 요청을 끊고 ApiError(code: "TIMEOUT") 를 던진다 */
  timeoutMs?: number;
}

/**
 * JSON API 를 호출한다. 성공 시 본문을 T 로, 204 No Content 는 undefined 로 돌려준다.
 * T 는 호출하는 쪽의 선언일 뿐 런타임 검증은 하지 않는다 — API 경계 타입은 types/api.ts 가 기준이다.
 */
export async function requestJson<T>(
  url: string,
  { timeoutMs, signal, headers, ...init }: RequestJsonInit = {},
): Promise<T> {
  const signals = [signal, timeoutMs === undefined ? undefined : AbortSignal.timeout(timeoutMs)];
  const activeSignals = signals.filter((s): s is AbortSignal => s != null);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...headers },
      signal: activeSignals.length > 0 ? AbortSignal.any(activeSignals) : undefined,
    });
  } catch (cause) {
    // 호출한 쪽이 직접 취소한 요청은 실패가 아니므로 그대로 올린다 (타임아웃은 TimeoutError 로 구분된다)
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw ApiError.fromFetchFailure(cause);
  }

  if (!res.ok) throw await ApiError.fromResponse(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
