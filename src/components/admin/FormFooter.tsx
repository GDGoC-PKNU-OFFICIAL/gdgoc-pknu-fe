"use client";

import Link from "next/link";

import Button, { buttonStyles } from "@/components/ui/Button";
import { formatKstTime } from "@/lib/date";

import { SLOW_NOTICE_MESSAGE } from "./hooks/use-slow-notice";

interface FormFooterProps {
  /** 취소 시 돌아갈 목록 경로. 변경사항이 있으면 useLeaveWarning 이 확인을 받는다 */
  cancelHref: string;
  pending: boolean;
  /** 저장 요청이 오래 걸리는 중 (콜드 스타트) */
  slow: boolean;
  /** 마지막 임시 저장 시각 (epoch ms) */
  draftSavedAt: number | null;
}

/**
 * 관리자 폼 하단 고정 버튼 `취소` · `저장` (IA 8-4) + 임시 저장 상태 "임시 저장됨 · 14:32" (IA 8-6).
 * 폼 안에 두어야 저장 버튼이 submit 으로 동작한다.
 */
export default function FormFooter({ cancelHref, pending, slow, draftSavedAt }: FormFooterProps) {
  const status = slow
    ? SLOW_NOTICE_MESSAGE
    : draftSavedAt !== null
      ? `임시 저장됨 · ${formatKstTime(new Date(draftSavedAt))}`
      : "";

  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8">
      <p aria-live="polite" className="min-h-5 text-xs text-ink-muted">
        {status}
      </p>
      <div className="flex gap-2 sm:justify-end">
        <Link
          href={cancelHref}
          aria-disabled={pending || undefined}
          className={buttonStyles({
            variant: "secondary",
            className: pending
              ? "pointer-events-none flex-1 opacity-50 sm:flex-none"
              : "flex-1 sm:flex-none",
          })}
        >
          취소
        </Link>
        <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
          {pending ? "저장 중…" : "저장"}
        </Button>
      </div>
    </div>
  );
}
