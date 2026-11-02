import { type ReactNode } from "react";

import Link from "next/link";

import SectionHeader from "./SectionHeader";

/** 공개 페이지 본문 폭 · 여백 */
export const SECTION_CONTAINER = "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8";

interface PageSectionProps {
  /** 제목 요소 id 의 접두어 — aria-labelledby 대상 */
  id: string;
  /** IA 10-2 섹션 헤더 */
  badge: string;
  title: string;
  subtitle?: string;
  /** 섹션 아래 페이지 안 이동 링크 (IA 3-4) */
  link?: { label: string; href: string };
  children: ReactNode;
}

/** 공개 페이지 섹션: 헤더 + 본문 + 이동 링크 */
export default function PageSection({
  id,
  badge,
  title,
  subtitle,
  link,
  children,
}: PageSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section aria-labelledby={titleId} className={SECTION_CONTAINER}>
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
