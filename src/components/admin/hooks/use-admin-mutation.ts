// src/components/admin/hooks/use-admin-mutation.ts
// 관리자 쓰기 요청(저장 · 삭제)의 공통 처리 (FRONT_ARCHITECTURE § 5-4 "저장 · 토스트 · 이동").
// - 성공: 성공 토스트 (IA 8-5)
// - 401: 로그인으로 이동. 임시 저장본은 지우지 않는다 — 로그인 후 같은 화면으로 돌아와 복원한다 (PRD 4-6)
// - 그 밖의 실패: onError(필드 에러를 폼에 붙이기 등) 후 실패 토스트에 서버 메시지를 그대로 보여 준다

import { useCallback, useState } from "react";

import { redirectToLogin } from "@/components/admin/lib/redirect-to-login";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/api-error";

const UNKNOWN_ERROR_MESSAGE = "일시적인 오류가 발생했습니다.";

export type MutationResult<T> = { ok: true; data: T } | { ok: false };

interface MutationOptions {
  /** 성공 토스트 문구. 없으면 띄우지 않는다 */
  successMessage?: string;
  /** 401 이 아닌 ApiError 를 받았을 때. 문자열을 돌려주면 실패 토스트 문구를 그것으로 바꾼다 */
  onError?: (error: ApiError) => string | void;
}

export function useAdminMutation() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T>(
      action: () => Promise<T>,
      { successMessage, onError }: MutationOptions = {},
    ): Promise<MutationResult<T>> => {
      setPending(true);
      try {
        const data = await action();
        if (successMessage) toast.success(successMessage);
        setPending(false);
        return { ok: true, data };
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          // 이동하는 동안 버튼은 계속 비활성으로 둔다
          redirectToLogin(error.code === "TOKEN_EXPIRED");
          return { ok: false };
        }
        setPending(false);
        if (error instanceof ApiError) {
          toast.error(onError?.(error) || error.message);
        } else {
          console.error("[admin] 요청 처리 중 알 수 없는 오류", error);
          toast.error(UNKNOWN_ERROR_MESSAGE);
        }
        return { ok: false };
      }
    },
    [toast],
  );

  return { run, pending };
}
