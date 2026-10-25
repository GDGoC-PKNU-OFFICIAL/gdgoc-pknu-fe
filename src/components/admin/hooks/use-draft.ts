// src/components/admin/hooks/use-draft.ts
// 관리자 폼 임시 저장 (PRD 4-6 · IA 8-6 · FRONT_ARCHITECTURE § 5-4).
//
// 흐름
//   1) 폼 진입: 임시 저장본이 있으면 pendingDraft 로 알려 준다 → 화면이 복원 확인 모달을 띄운다 (IA 8-5).
//      답하기 전에는 자동 저장하지 않는다 — 모달 뒤에서 입력이 저장본을 덮어쓰면 복원할 내용이 사라진다.
//   2) 자동 저장: 마지막 입력 후 1초 뒤. 처음 불러온 값과 같아지면(변경 취소) 저장본을 지운다.
//   3) 삭제: 저장 성공(clear) · 사용자가 "삭제" 선택(discard) · 7일 경과(draft-storage) · 로그아웃(clearAllDrafts)
//
// 저장본은 브라우저에만 있으므로 서버 렌더링 때는 알 수 없다. useSyncExternalStore 의 서버 값을 undefined 로 두어
// "아직 모름" 을 구분하고, 브라우저에서 처음 읽은 뒤에 복원 여부를 묻는다 (hydration 불일치 방지).

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DRAFT_SAVE_DELAY_MS } from "@/constants/config";
import type { IsoDateTime } from "@/types/api";

import {
  type Draft,
  parseDraft,
  readDraftRaw,
  removeDraft,
  writeDraft,
} from "../lib/draft-storage";

import type { FieldValues, UseFormReturn } from "react-hook-form";

// 저장본은 이 훅이 직접 쓰고 지우므로 외부 변경을 구독하지 않는다
const subscribeNothing = () => () => {};

interface UseDraftOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** draftKey(resource, id | "new") */
  storageKey: string;
  /** 수정 폼: 서버에서 불러온 updatedAt. 등록 폼은 null */
  serverUpdatedAt: IsoDateTime | null;
}

export interface DraftState<T> {
  /** 진입 시 발견한 저장본. 복원 · 삭제를 고르기 전까지 값이 있다 */
  pendingDraft: Draft<T> | null;
  /** 저장본을 만든 뒤 서버 데이터가 수정되었는지 (IA 8-5 "임시 저장 이후에 수정되었습니다") */
  pendingDraftIsStale: boolean;
  /** 마지막으로 임시 저장한 시각 (epoch ms). 화면 표시용 */
  savedAt: number | null;
  restore: () => void;
  discard: () => void;
  /** 지금 값을 바로 저장한다 — 저장 요청 직전에 불러 401 로 로그인에 가도 내용이 남게 한다 */
  saveNow: () => void;
  /** 저장 성공 후. 저장본을 지우고 자동 저장을 멈춘다 */
  clear: () => void;
}

export function useDraft<T extends FieldValues>({
  form,
  storageKey,
  serverUpdatedAt,
}: UseDraftOptions<T>): DraftState<T> {
  // 서버: undefined(모름) / 브라우저: 문자열 또는 null. 같은 문자열이면 같은 값이라 렌더가 안정적이다
  const storedRaw = useSyncExternalStore(
    subscribeNothing,
    () => readDraftRaw(storageKey),
    () => undefined,
  );
  const storedDraft = useMemo(() => (storedRaw ? parseDraft<T>(storedRaw) : null), [storedRaw]);

  /** 복원 · 삭제를 골랐거나, 저장본 없이 입력을 시작했는지 */
  const [answered, setAnswered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const known = storedRaw !== undefined;
  const pendingDraft = known && !answered ? storedDraft : null;
  const autosaveEnabled = known && pendingDraft === null && !stopped;

  /** 지금 값을 저장하거나, 처음 값과 같으면 저장본을 지운다 */
  const persist = useCallback(() => {
    const values = form.getValues();
    setAnswered(true);
    if (JSON.stringify(values) === JSON.stringify(form.formState.defaultValues)) {
      removeDraft(storageKey);
      setSavedAt(null);
      return;
    }
    const at = writeDraft(storageKey, values, serverUpdatedAt);
    if (at !== null) setSavedAt(at);
  }, [form, storageKey, serverUpdatedAt]);

  /** 대기 중인 자동 저장을 취소한다. 대기 중이었는지 돌려준다 */
  const cancelPending = useCallback(() => {
    if (timer.current === undefined) return false;
    clearTimeout(timer.current);
    timer.current = undefined;
    return true;
  }, []);

  useEffect(() => {
    if (!autosaveEnabled) return;
    // 마지막 입력 후 1초 안에 떠나도(링크 이동 · 탭 닫기) 그 입력까지 남긴다 — 이탈 경고가 그렇게 약속한다
    const flush = () => {
      if (cancelPending()) persist();
    };
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: () => {
        cancelPending();
        timer.current = setTimeout(() => {
          timer.current = undefined;
          persist();
        }, DRAFT_SAVE_DELAY_MS);
      },
    });
    window.addEventListener("pagehide", flush);
    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [autosaveEnabled, form, persist, cancelPending]);

  const restore = useCallback(() => {
    if (!storedDraft) return;
    // 기준값(defaultValues)은 서버 값으로 둔다 — 복원한 내용이 "변경사항"으로 잡혀 이탈 경고 · 자동 저장이 이어진다
    form.reset(storedDraft.values, { keepDefaultValues: true });
    setSavedAt(storedDraft.savedAt);
    setAnswered(true);
  }, [form, storedDraft]);

  const discard = useCallback(() => {
    removeDraft(storageKey);
    setAnswered(true);
  }, [storageKey]);

  const saveNow = useCallback(() => {
    if (stopped || pendingDraft !== null) return;
    cancelPending();
    persist();
  }, [stopped, pendingDraft, persist, cancelPending]);

  const clear = useCallback(() => {
    // 대기 중인 저장을 먼저 취소한다 — 자동 저장이 꺼지며 cleanup 이 flush 해 저장본을 되살리지 않게
    cancelPending();
    setStopped(true);
    removeDraft(storageKey);
  }, [storageKey, cancelPending]);

  const pendingDraftIsStale =
    pendingDraft !== null &&
    pendingDraft.serverUpdatedAt !== null &&
    serverUpdatedAt !== null &&
    Date.parse(serverUpdatedAt) > Date.parse(pendingDraft.serverUpdatedAt);

  return {
    pendingDraft,
    pendingDraftIsStale,
    savedAt,
    restore,
    discard,
    saveNow,
    clear,
  };
}
