// src/components/admin/hooks/use-session-expiry.ts
// 세션 만료 감시 (IA 8-2 · 8-5). 리프레시 토큰이 없으므로 8시간이 지나면 다시 로그인해야 한다.
// - 만료 10분 전: 경고 토스트 1회
// - 만료 시각: /admin/login?next={현재 경로}&reason=expired 로 이동. 임시 저장본은 지우지 않는다 — 로그인 후 복원한다 (PRD 4-6).
//
// 만료 시각은 /api/admin/session 이 쿠키 JWT 에서 읽어 준다 (httpOnly 라 브라우저 JS 가 직접 읽을 수 없다).
// 노트북 절전 중에는 타이머가 멈추므로, 탭이 다시 보일 때마다 세션을 다시 조회해 타이머를 새로 건다.

import { useEffect, useRef } from "react";

import {
  ADMIN_NEXT_PARAM,
  ADMIN_REASON_EXPIRED,
  ADMIN_REASON_PARAM,
  ADMIN_ROUTES,
} from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";

const WARNING_BEFORE_MS = 10 * 60 * 1000;

/**
 * 전체 페이지 이동으로 로그인에 보낸다. 클라이언트 라우터 이동은 캐시된 관리자 화면을 보여 줄 수 있고,
 * 전체 이동이어야 proxy.ts 가 다시 돌아 만료 쿠키를 지운다.
 * expired 면 로그인 폼이 만료 안내를 보여 주도록 reason 을 붙인다 (쿠키가 처음부터 없던 경우는 붙이지 않는다).
 */
function redirectToLogin(expired: boolean) {
  const { pathname, search } = window.location;
  const loginUrl = new URL(ADMIN_ROUTES.login, window.location.origin);
  loginUrl.searchParams.set(ADMIN_NEXT_PARAM, `${pathname}${search}`);
  if (expired) loginUrl.searchParams.set(ADMIN_REASON_PARAM, ADMIN_REASON_EXPIRED);
  window.location.assign(loginUrl);
}

export function useSessionExpiry() {
  const toast = useToast();
  /** 경고를 이미 띄운 만료 시각. 탭 전환으로 다시 조회해도 같은 세션이면 경고를 반복하지 않는다 */
  const warnedFor = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    async function schedule() {
      clearTimers();

      let expiresAtMs: number;
      try {
        expiresAtMs = Date.parse((await getSession()).expiresAt);
      } catch (error) {
        // 401 은 이미 만료 · 쿠키 없음. 네트워크 오류는 다음 탭 복귀 때 다시 확인한다 (화면을 막지 않는다)
        if (!disposed && error instanceof ApiError && error.status === 401) {
          redirectToLogin(error.code === "TOKEN_EXPIRED");
        }
        return;
      }
      if (disposed) return;

      const remainingMs = expiresAtMs - Date.now();
      if (remainingMs <= 0) {
        redirectToLogin(true);
        return;
      }

      if (warnedFor.current !== expiresAtMs) {
        timers.push(
          setTimeout(
            () => {
              warnedFor.current = expiresAtMs;
              // 이미 10분 안쪽에서 들어왔으면 실제 남은 분을 알려 준다
              const minutes = Math.max(1, Math.ceil((expiresAtMs - Date.now()) / 60_000));
              toast.warning(
                `로그인이 ${Math.min(minutes, 10)}분 후 만료됩니다. 작성 중인 내용은 임시 저장됩니다.`,
              );
            },
            Math.max(0, remainingMs - WARNING_BEFORE_MS),
          ),
        );
      }
      timers.push(setTimeout(() => redirectToLogin(true), remainingMs));
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void schedule();
    };

    void schedule();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      clearTimers();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [toast]);
}
