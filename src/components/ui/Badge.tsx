import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

const TONE_CLASSES = {
  blue: "bg-brand-blue/10 text-brand-blue",
  red: "bg-brand-red/10 text-brand-red",
  yellow: "bg-brand-yellow/15 text-[#8a6100]", // 노랑 글자는 흰 배경 대비 부족 → 어두운 톤
  green: "bg-brand-green/10 text-[#1e7e34]",
  neutral: "bg-surface-muted text-ink-muted",
} as const;

export type BadgeTone = keyof typeof TONE_CLASSES;

type BadgeProps = ComponentPropsWithoutRef<"span"> & { tone?: BadgeTone };

/**
 * 상태 · 분류를 짧게 표시하는 배지 (섹션 헤더 배지, 멤버 역할 배지, 모집 상태 등).
 * 라벨 문자열은 호출하는 쪽에서 넘긴다 — components/ui 는 constants/labels 를 모른다.
 */
export default function Badge({ tone = "blue", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
