"use client";

import { formatKstDateTime } from "@/lib/date";

import ConfirmDialog from "./ConfirmDialog";

interface DraftRestoreDialogProps {
  /** 발견한 저장본의 저장 시각 (epoch ms). null 이면 닫힌다 */
  savedAt: number | null;
  /** 저장본을 만든 뒤 서버 데이터가 수정되었는지 */
  stale: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}

/**
 * 임시 저장본 복원 확인 (IA 8-5 "임시 저장본 발견" · "임시 저장본이 서버보다 오래됨").
 * 반드시 둘 중 하나를 고르게 한다 — ESC 로 닫아 버리면 이후 자동 저장이 저장본을 덮어쓴다.
 */
export default function DraftRestoreDialog({
  savedAt,
  stale,
  onRestore,
  onDiscard,
}: DraftRestoreDialogProps) {
  return (
    <ConfirmDialog
      open={savedAt !== null}
      title="임시 저장된 내용이 있습니다"
      confirmLabel="불러오기"
      cancelLabel="삭제"
      dismissible={false}
      onConfirm={onRestore}
      onCancel={onDiscard}
    >
      <p>
        임시 저장된 내용이 있습니다({savedAt !== null && formatKstDateTime(new Date(savedAt))}).
        불러올까요?
      </p>
      {stale && (
        <p className="mt-2 rounded-lg bg-brand-yellow/15 px-3 py-2 text-ink">
          이 항목은 임시 저장 이후에 수정되었습니다. 불러오면 최신 내용을 덮어씁니다.
        </p>
      )}
    </ConfirmDialog>
  );
}
