import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type TagProps = ComponentPropsWithoutRef<"span">;

/**
 * 키워드 태그 — 기술 스택(#Next.js), 관심분야(#LLM), 스터디 주제 등.
 * 클릭 요소가 아니다. 필터처럼 보이지 않도록 버튼 모양(테두리 강조 · hover)을 주지 않는다.
 */
export default function Tag({ className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-md bg-surface-muted px-2 py-0.5 text-xs text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}
