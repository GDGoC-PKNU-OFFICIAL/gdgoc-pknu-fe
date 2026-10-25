// src/components/admin/lib/leave-page.ts
// 코드가 직접 하는 전체 페이지 이동 (로그인 리다이렉트 · 로그아웃).
//
// 변경사항이 있는 폼이면 useLeaveWarning 의 beforeunload 가 "사이트에서 나가시겠습니까?" 를 띄운다.
// 여기서 "머무르기" 를 고르면 저장 중 상태로 멈춘 폼에 갇히므로, 이 이동은 경고 없이 보낸다.
// 임시 저장본은 그대로 남아 돌아오면 복원 확인이 뜬다 (PRD 4-6).

let leaving = false;

/** useLeaveWarning 이 경고를 건너뛸지 */
export function isLeavingPage(): boolean {
  return leaving;
}

export function leavePage(url: string | URL): void {
  leaving = true;
  window.location.assign(url);
}
