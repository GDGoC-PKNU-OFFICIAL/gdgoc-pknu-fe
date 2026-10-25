// src/components/admin/lib/draft-storage.ts
// 관리자 폼 임시 저장본 (PRD 4-6 · IA 8-6). 키: gdg-admin-draft:{resource}:{id 또는 new}
// 읽기 · 쓰기 · 삭제만 둔다. 언제 저장하고 언제 복원을 묻는지는 useDraft 가 정한다.
//
// 시크릿 모드 · 저장소 차단 · 용량 초과 환경에서는 localStorage 접근 자체가 throw 할 수 있다.
// 임시 저장은 보조 기능이므로 실패해도 폼 작성을 막지 않는다 — 모든 함수가 예외를 삼킨다.

import { DRAFT_TTL_MS } from "@/constants/config";
import type { AdminResource, IsoDateTime } from "@/types/api";

export const DRAFT_KEY_PREFIX = "gdg-admin-draft:";

/**
 * 저장 형식 버전. 폼 값의 모양을 바꾸면 올린다 — 버전이 다른 저장본은 복원하지 않고 지운다
 * (예전 모양의 값을 폼에 넣으면 입력칸이 깨지거나 저장 요청이 400 이 된다).
 */
const DRAFT_VERSION = 1;

/** 임시 저장 대상 (IA 8-6): 4개 리소스의 등록 · 수정 폼 + 사이트 설정 */
export type DraftResource = AdminResource | "settings";

export interface Draft<T> {
  version: typeof DRAFT_VERSION;
  /** 폼 입력값 전체. 이미지는 파일이 아니라 업로드 완료된 publicUrl 만 들어 있다 */
  values: T;
  /** 저장 시각 (epoch ms) — "임시 저장됨 · 14:32" · 복원 확인 문구 · 7일 만료에 쓴다 */
  savedAt: number;
  /** 수정 폼: 불러온 시점의 서버 updatedAt. 등록 폼 · 사이트 설정 첫 저장은 null */
  serverUpdatedAt: IsoDateTime | null;
}

/** @example draftKey("projects", "new") // "gdg-admin-draft:projects:new" */
export function draftKey(resource: DraftResource, id: number | "new"): string {
  return `${DRAFT_KEY_PREFIX}${resource}:${id}`;
}

function isDraft(value: unknown): value is Draft<unknown> {
  if (typeof value !== "object" || value === null) return false;
  const { version, savedAt, values } = value as Record<string, unknown>;
  return version === DRAFT_VERSION && typeof savedAt === "number" && values !== undefined;
}

/**
 * 저장된 문자열을 해석한다 (순수 함수 — 렌더 중에 불러도 된다).
 * values 의 세부 모양은 검사하지 않는다 (작성 중인 값이라 검증 규칙을 통과하지 않는 게 정상이다).
 */
export function parseDraft<T>(raw: string): Draft<T> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? (parsed as Draft<T>) : null;
  } catch {
    return null;
  }
}

/**
 * 쓸 수 있는 저장본의 원문. 없거나, 모양이 다르거나, 7일이 지났으면 null — 쓸 수 없는 저장본은 이 자리에서 지운다.
 * 원문(문자열)을 돌려주는 이유: 같은 내용이면 같은 값이라 useSyncExternalStore 의 스냅샷으로 바로 쓸 수 있다.
 */
export function readDraftRaw(key: string, now: number = Date.now()): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const draft = parseDraft(raw);
    if (draft !== null && now - draft.savedAt <= DRAFT_TTL_MS) return raw;
    localStorage.removeItem(key);
  } catch {
    // 저장소 접근 불가 — 복원할 것이 없다
  }
  return null;
}

/** 로그아웃으로 모두 지운 뒤인지. 페이지를 떠나며 하는 마지막 자동 저장(pagehide)이 저장본을 되살리지 않게 한다 */
let cleared = false;

/** 저장 성공 시 저장 시각, 실패 시 null (용량 초과 · 저장소 차단 · 로그아웃 후) */
export function writeDraft<T>(
  key: string,
  values: T,
  serverUpdatedAt: IsoDateTime | null,
  now: number = Date.now(),
): number | null {
  if (cleared) return null;
  const draft: Draft<T> = { version: DRAFT_VERSION, values, savedAt: now, serverUpdatedAt };
  try {
    localStorage.setItem(key, JSON.stringify(draft));
    return now;
  } catch {
    return null;
  }
}

export function removeDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // 저장소 접근 불가 — 지울 것도 없다
  }
}

/**
 * 모든 임시 저장본을 지운다. 공용 계정 · 공용 PC 를 고려해 로그아웃 때 호출한다.
 */
export function clearAllDrafts(): void {
  cleared = true;
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
