"use client";

import { useSessionExpiry } from "@/components/admin/hooks/use-session-expiry";

/**
 * 관리자 레이아웃(서버 컴포넌트)이 훅을 직접 부를 수 없어 두는 빈 클라이언트 컴포넌트.
 * 레이아웃은 관리자 화면 사이를 이동해도 다시 마운트되지 않으므로 감시는 한 번만 시작된다.
 */
export default function SessionExpiryWatcher() {
  useSessionExpiry();
  return null;
}
