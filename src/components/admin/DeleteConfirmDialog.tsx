"use client";

import ConfirmDialog from "./ConfirmDialog";

interface DeleteConfirmDialogProps {
  /** 삭제 대상 이름. null 이면 닫힌다 */
  targetName: string | null;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 삭제 확인 모달 (IA 8-3 "'{이름}'을(를) 삭제할까요? 되돌릴 수 없습니다").
 * 실수로 Enter 를 눌러도 지워지지 않게 처음 포커스는 "취소" 에 둔다.
 */
export default function DeleteConfirmDialog({
  targetName,
  pending,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={targetName !== null}
      title="삭제 확인"
      confirmLabel="삭제"
      pendingLabel="삭제 중…"
      cancelLabel="취소"
      confirmVariant="danger"
      initialFocus="cancel"
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>
        <strong className="font-semibold text-ink">&apos;{targetName}&apos;</strong>을(를)
        삭제할까요? 되돌릴 수 없습니다.
      </p>
    </ConfirmDialog>
  );
}
