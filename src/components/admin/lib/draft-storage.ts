// src/components/admin/lib/draft-storage.ts
// 관리자 폼 임시 저장본 (PRD 4-6 · IA 8-6). 키: gdg-admin-draft:{resource}:{id 또는 new}
// 지금은 로그아웃 시 전체 삭제만 있다. 저장 · 복원 · 7일 만료는 useDraft(Phase 5 #27)에서 이 파일에 추가한다.

export const DRAFT_KEY_PREFIX = "gdg-admin-draft:";

/**
 * 모든 임시 저장본을 지운다. 공용 계정 · 공용 PC 를 고려해 로그아웃 때 호출한다.
 * 시크릿 모드 · 저장소 차단 환경에서는 localStorage 접근 자체가 throw 할 수 있다 — 지울 것도 없으므로 무시한다.
 */
export function clearAllDrafts(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_KEY_PREFIX)) keys.push(key);
    }
    // 순회 중에 지우면 인덱스가 밀리므로 모은 뒤 지운다
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 저장소 접근 불가
  }
}
