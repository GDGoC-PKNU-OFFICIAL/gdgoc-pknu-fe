"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

import Button, { type ButtonVariant } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  /** 확인 동작 진행 중 — 두 버튼을 막고 ESC 로 닫히지 않게 한다 */
  pending?: boolean;
  pendingLabel?: string;
  /** 처음 포커스를 받을 버튼. 되돌릴 수 없는 동작은 "cancel" 로 둔다 */
  initialFocus?: "confirm" | "cancel";
  /** false 면 ESC · 바깥 클릭으로 닫히지 않는다 — 반드시 둘 중 하나를 고르게 할 때 */
  dismissible?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function show(dialog: HTMLDialogElement) {
  dialog.showModal();
  // showModal 은 DOM 순서상 첫 버튼(취소)에 포커스를 준다. 원하는 버튼으로 옮긴다
  dialog.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
}

/**
 * 확인 모달 (IA 8-3 삭제 확인 · 8-5 임시 저장본 복원). 네이티브 <dialog>.showModal() 로
 * 포커스 가두기 · 뒤 화면 inert 를 브라우저에 맡긴다 (공개 상세 카드 C-08 과 같은 방식).
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  pending = false,
  pendingLabel,
  initialFocus = "confirm",
  dismissible = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) show(dialog);
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const canDismiss = dismissible && !pending;
  const requestCancel = () => {
    if (canDismiss) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // ESC: 브라우저가 바로 닫지 않게 막고 open prop 으로만 닫는다 (상태와 화면이 어긋나지 않게).
      // 막을 수 없는 cancel(Chrome CloseWatcher — 사용자 입력 없이 열렸거나 ESC 를 연달아 누름)은 onClose 가 처리한다
      onCancel={(event) => {
        if (!event.cancelable) return;
        event.preventDefault();
        requestCancel();
      }}
      // open prop 이 아직 true 인데 브라우저가 닫았다: 닫아도 되면 부모에 알리고, 아니면 다시 연다
      onClose={(event) => {
        if (!open) return;
        if (canDismiss) onCancel();
        else show(event.currentTarget);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/60"
    >
      {open && (
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <div id={descriptionId} className="text-sm leading-relaxed break-keep text-ink-muted">
              {children}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              disabled={pending}
              data-initial-focus={initialFocus === "cancel" || undefined}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              disabled={pending}
              data-initial-focus={initialFocus === "confirm" || undefined}
              onClick={onConfirm}
            >
              {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
