import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

/** Input · Textarea · Select 가 같이 쓰는 테두리 · 포커스 · 에러 모양 */
export function fieldControlStyles({
  invalid,
  className,
}: { invalid?: boolean; className?: string } = {}): string {
  return cn(
    // 모든 터치 요소 최소 44×44px (IA 5-7)
    "min-h-11 w-full rounded-lg border bg-surface px-3 text-base text-ink outline-none",
    "placeholder:text-ink-muted/70 disabled:bg-surface-muted disabled:text-ink-muted",
    "focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/30",
    invalid ? "border-brand-red" : "border-line",
    className,
  );
}

type InputProps = ComponentPropsWithRef<"input"> & {
  /** 에러 테두리 + aria-invalid */
  invalid?: boolean;
};

/** 한 줄 입력칸. 라벨 · 에러 문구는 감싸는 쪽(관리자 FormField 등)이 붙인다 */
export default function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid ? true : undefined}
      className={fieldControlStyles({ invalid, className })}
      {...props}
    />
  );
}
