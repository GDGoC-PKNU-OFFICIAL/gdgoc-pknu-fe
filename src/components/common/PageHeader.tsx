import { type ReactNode } from "react";

interface PageHeaderProps {
  /** 영문 페이지 제목 ("About", "Projects" …) — 페이지의 유일한 h1 */
  title: string;
  /** 한 줄 설명 */
  description: string;
  /** 제목 아래 보조 정보 (개인정보처리방침 시행일 등) */
  children?: ReactNode;
}

/** 공개 페이지 상단 헤더 (IA 4장 각 페이지 #1) */
export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="border-b border-line bg-surface-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        <p className="text-base break-keep text-ink-muted md:text-lg">{description}</p>
        {children}
      </div>
    </header>
  );
}
