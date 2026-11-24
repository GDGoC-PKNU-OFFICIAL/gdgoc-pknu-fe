import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/**
 * 배지 바탕 (연한 색). 다크 모드는 어두운 면 위라 조금 더 진하게 깐다.
 * 글자 색은 BADGE_TEXT_CLASSES — 배지 없이 글자로만 분류를 보여 줄 때(프로젝트 쇼케이스 카드)도 같은 색을 쓴다.
 */
const TONE_BG_CLASSES = {
  blue: "bg-brand-blue/10 dark:bg-brand-blue/20",
  red: "bg-brand-red/10 dark:bg-brand-red/20",
  yellow: "bg-brand-yellow/15 dark:bg-brand-yellow/20",
  green: "bg-brand-green/10 dark:bg-brand-green/20",
  purple: "bg-[#a142f4]/10 dark:bg-[#a142f4]/25",
  neutral: "bg-surface-muted",
} as const;

export type BadgeTone = keyof typeof TONE_BG_CLASSES;

/**
 * 배지 글자 색. 라이트는 흰 바탕에서, 다크는 어두운 바탕에서 읽히도록(대비 4.5:1 이상) 따로 고른다.
 * 브랜드 원색은 다크 바탕에서 어둡게 가라앉아 밝은 톤으로 바꾼다.
 */
export const BADGE_TEXT_CLASSES = {
  blue: "text-[#1a73e8] dark:text-[#8ab4f8]",
  red: "text-[#d93025] dark:text-[#f28b82]",
  yellow: "text-[#8a6100] dark:text-[#fdd663]", // 노랑 글자는 흰 배경 대비 부족 → 어두운 톤
  green: "text-[#1e7e34] dark:text-[#81c995]",
  purple: "text-[#8430ce] dark:text-[#d7aefb]",
  neutral: "text-ink-muted",
} satisfies Record<BadgeTone, string>;

type BadgeProps = ComponentPropsWithoutRef<"span"> & { tone?: BadgeTone };

/**
 * 상태 · 분류를 짧게 표시하는 배지 (섹션 헤더 배지, 프로젝트 배지, 모집 상태 등).
 * 라벨 문자열은 호출하는 쪽에서 넘긴다 — components/ui 는 constants/labels 를 모른다.
 */
export default function Badge({ tone = "blue", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        TONE_BG_CLASSES[tone],
        BADGE_TEXT_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
