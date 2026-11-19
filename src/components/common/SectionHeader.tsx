import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** 한국어 배지 (IA 10-2). 없으면 그리지 않는다 (홈) */
  badge?: string;
  /** 영문 타이틀 */
  title: string;
  /** 한국어 부제 (선택) */
  subtitle?: string;
  /** 제목 요소 id — 섹션의 aria-labelledby 대상 */
  titleId?: string;
  align?: "left" | "center";
  /**
   * 타이틀 모양. home = 메인 페이지 전용 — Roboto Condensed(GNB 글꼴) · 더 크게 · Bold.
   */
  variant?: "default" | "home";
  /** 제목 줄 오른쪽 "자세히 보기" 버튼. label 은 화면 읽기 프로그램에 어디로 가는지 알려 준다 */
  link?: { label: string; href: string };
  className?: string;
}

const TITLE_CLASSES = {
  default: "text-2xl font-bold tracking-tight md:text-3xl",
  home: "font-nav text-3xl font-bold tracking-tight md:text-[2.5rem] md:leading-tight",
} as const;

/** 섹션 헤더: [한국어 배지] → 영문 타이틀 → 한국어 부제 (IA 10-2) */
export default function SectionHeader({
  badge,
  title,
  subtitle,
  titleId,
  align = "left",
  variant = "default",
  link,
  className,
}: SectionHeaderProps) {
  const heading = (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        !link && className,
      )}
    >
      {badge && <Badge>{badge}</Badge>}
      <h2 id={titleId} className={TITLE_CLASSES[variant]}>
        {title}
      </h2>
      {subtitle && <p className="text-sm break-keep text-ink-muted md:text-base">{subtitle}</p>}
    </div>
  );

  if (!link) return heading;

  // 왼쪽 제목 · 오른쪽 버튼. 버튼은 제목 첫 줄 높이에 맞춘다
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {heading}
      <Link
        href={link.href}
        className={cn(
          "group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink",
          "transition-colors hover:border-brand-blue hover:text-brand-blue",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
          variant === "home" && "md:mt-1",
        )}
      >
        <span className="sr-only">{link.label}: </span>
        자세히 보기
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
        >
          →
        </span>
      </Link>
    </div>
  );
}
