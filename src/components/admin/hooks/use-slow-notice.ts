// src/components/admin/hooks/use-slow-notice.ts
// 요청이 오래 걸리면 Render 콜드 스타트로 보고 "서버를 깨우는 중" 안내를 켠다 (IA 8-5 · PRD 1장 7번).

import { useEffect, useState } from "react";

import { ADMIN_SLOW_NOTICE_MS } from "@/constants/config";

export const SLOW_NOTICE_MESSAGE = "서버를 깨우는 중입니다. 최대 30초 걸릴 수 있습니다.";

/** active 가 ADMIN_SLOW_NOTICE_MS 이상 이어지면 true. active 가 꺼지면 바로 false */
export function useSlowNotice(active: boolean): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setSlow(true), ADMIN_SLOW_NOTICE_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [active]);

  return active && slow;
}
