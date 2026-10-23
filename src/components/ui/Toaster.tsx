"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type ToastApi, ToastContext, type ToastTone } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";

/** 경고(세션 만료 임박)는 놓치면 작성 중인 내용을 잃을 수 있어 가장 오래 둔다 */
const DURATION_MS: Record<ToastTone, number> = {
  success: 4_000,
  error: 6_000,
  warning: 10_000,
};

/** 한 번에 보이는 최대 개수. 넘치면 오래된 것부터 밀어낸다 */
const MAX_VISIBLE = 3;

const TONE_STYLES: Record<ToastTone, { bar: string; label: string }> = {
  success: { bar: "bg-brand-green", label: "성공" },
  error: { bar: "bg-brand-red", label: "실패" },
  warning: { bar: "bg-brand-yellow", label: "경고" },
};

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

/**
 * 토스트 Provider + 표시 영역 (IA 8-5). 관리자 레이아웃이 감싼다.
 * - 표시 영역은 항상 DOM 에 두는 aria-live 영역이라 새 토스트가 스크린 리더에 읽힌다. 실패는 role="alert" 로 즉시 읽힌다.
 * - 애니메이션이 없으므로 "모션 줄이기" 분기가 필요 없다.
 */
export default function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const show = (tone: ToastTone, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, tone, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS[tone]),
      );
    };
    return {
      show,
      success: (message) => show("success", message),
      error: (message) => show("error", message),
      warning: (message) => show("warning", message),
    };
  }, [dismiss]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        aria-label="알림"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:w-96"
      >
        {toasts.map(({ id, tone, message }) => (
          <div
            key={id}
            role={tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface py-3 pr-2 pl-4 text-sm text-ink shadow-lg"
          >
            <span
              aria-hidden="true"
              className={cn("mt-1 size-2.5 shrink-0 rounded-full", TONE_STYLES[tone].bar)}
            />
            <p className="flex-1 py-0.5 leading-relaxed break-keep">
              <span className="sr-only">{TONE_STYLES[tone].label}: </span>
              {message}
            </p>
            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => dismiss(id)}
              className="-my-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
