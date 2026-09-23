import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  /** IA 10-3 빈 상태 문구 */
  message: string;
  /** 문구 아래 버튼 등 (관리자 "새로 등록" 등) */
  action?: ReactNode;
  className?: string;
}

/** 목록 0건 안내 (C-09). 문구는 호출하는 쪽에서 IA 10-3 표 그대로 넘긴다. */
export default function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm break-keep text-ink-muted">{message}</p>
      {action}
    </div>
  );
}
