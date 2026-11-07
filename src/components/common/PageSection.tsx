import { type ReactNode } from "react";

import Link from "next/link";

import { cn } from "@/lib/cn";

import SectionHeader from "./SectionHeader";

/** 공개 페이지 본문 폭 · 여백 */
export const SECTION_CONTAINER = "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8";

/**
 * 한 화면에 섹션 하나 (홈). 태블릿 · 데스크톱에서 Header(h-16) 아래 화면 높이를 채우고 스크롤 스냅 지점이 된다.
 * 내용이 더 길면 잘리지 않고 늘어난다. 모바일은 내용 높이 그대로다.
 * 스냅은 globals.css 의 [data-scroll-snap] 규칙이 켠다.
 */
export const FULL_SCREEN_SECTION = "md:min-h-[calc(100svh-4rem)] md:justify-center md:snap-start";

interface PageSectionProps {
  /** 제목 요소 id 의 접두어 — aria-labelledby 대상 */
  id: string;
  /** IA 10-2 섹션 헤더 */
  badge: string;
  title: string;
  subtitle?: string;
  /** 섹션 아래 페이지 안 이동 링크 (IA 3-4) */
  link?: { label: string; href: string };
  /** 한 화면을 섹션 하나가 차지한다 (FULL_SCREEN_SECTION) */
  fullScreen?: boolean;
  children: ReactNode;
}

/** 공개 페이지 섹션: 헤더 + 본문 + 이동 링크 */
export default function PageSection({
  id,
  badge,
  title,
  subtitle,
  link,
  fullScreen = false,
  children,
}: PageSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(SECTION_CONTAINER, fullScreen && FULL_SCREEN_SECTION)}
    >
      <SectionHeader badge={badge} title={title} subtitle={subtitle} titleId={titleId} />
      {children}
      {link && (
        <Link
          href={link.href}
          className="inline-flex min-h-11 items-center self-start text-sm font-medium text-brand-blue hover:underline"
        >
          {link.label} →
        </Link>
      )}
    </section>
  );
}
