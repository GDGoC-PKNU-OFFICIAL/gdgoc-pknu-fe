// src/components/admin/hooks/use-leave-warning.ts
// 변경사항이 있는 폼에서 나가려 하면 확인을 받는다 (IA 8-4 "이탈 경고 (임시 저장본은 유지)").
//
// - 새로고침 · 탭 닫기 · 주소 직접 입력: beforeunload (문구는 브라우저 기본 문구로 고정된다)
// - 사이드바 · 취소 등 페이지 안 링크: App Router 에는 이동을 막는 공식 API 가 없으므로,
//   document 캡처 단계에서 링크 클릭을 먼저 받아 confirm 한다. 캡처 리스너는 React 루트보다 먼저 돌기 때문에
//   여기서 막으면 next/link 의 클라이언트 이동도 일어나지 않는다.
// - router.push 로 하는 이동(저장 성공 후 목록)은 막지 않는다 — 저장이 끝났으니 경고할 이유가 없다.

import { useEffect } from "react";

export const LEAVE_WARNING_MESSAGE =
  "저장하지 않은 변경사항이 있습니다. 이 페이지를 나갈까요? 임시 저장된 내용은 남아 있습니다.";

/** 같은 탭에서 다른 페이지로 가는 링크인지. 새 탭 · 다운로드 · 같은 페이지 앵커는 경고하지 않는다 */
function isLeavingLink(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export function useLeaveWarning(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const onClickCapture = (event: MouseEvent) => {
      if (!isLeavingLink(event)) return;
      if (window.confirm(LEAVE_WARNING_MESSAGE)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [active]);
}
