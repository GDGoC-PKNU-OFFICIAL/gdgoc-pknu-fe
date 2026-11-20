// src/lib/focus.ts

/**
 * 포커스 표시(파란 테두리) 없이 포커스를 옮긴다 — 상세 카드를 닫은 뒤 연 카드로 포커스를 돌려줄 때.
 * 키보드 사용자는 위치를 잃지 않고(Tab 을 누르면 다시 표시된다), 마우스 사용자에게는 테두리가 남지 않는다.
 * FocusOptions.focusVisible 은 TypeScript 의 DOM 타입에 아직 없어 단언으로 넘긴다 (지원 안 하는 브라우저는 무시).
 */
export function focusWithoutRing(element: HTMLElement | null | undefined): void {
  element?.focus({ focusVisible: false } as FocusOptions);
}
