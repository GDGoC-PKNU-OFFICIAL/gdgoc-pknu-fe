import { type ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** 오른쪽 버튼 — 목록의 "+ 새로 등록" 등 (IA 8-1 "페이지 제목 [+ 새로 등록]") */
  action?: ReactNode;
}

/** 관리자 본문 상단 제목 줄 (IA 8-1 레이아웃) */
export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
