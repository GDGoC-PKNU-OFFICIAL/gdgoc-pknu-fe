import { type ReactNode } from "react";

interface FormWithPreviewProps {
  /** 미리보기 패널 제목 — 예: "프로젝트 카드 미리보기" */
  title: string;
  /** 패널 아래 안내 (어디에 이렇게 보이는지) */
  note?: string;
  preview: ReactNode;
  /** 폼 구역들 */
  children: ReactNode;
}

/**
 * 등록 · 수정 폼 + 공개 화면 미리보기 (입력하는 대로 바로 바뀐다).
 * 넓은 화면(xl)은 오른쪽에 붙여 스크롤해도 따라오고, 좁은 화면은 폼 위에 둔다.
 * 미리보기 안의 링크 · 버튼은 눌리지 않게 inert 로 막는다 (스크린 리더에서도 빠진다 — 내용은 바로 옆 폼과 같다).
 */
export default function FormWithPreview({ title, note, preview, children }: FormWithPreviewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <aside className="xl:sticky xl:top-16 xl:order-last xl:self-start">
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-muted px-4 py-2.5">
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="rounded bg-brand-blue/10 px-1.5 py-0.5 text-xs font-semibold text-brand-blue">
              실시간
            </span>
          </div>
          <div inert className="public-text pointer-events-none p-4 select-none">
            {preview}
          </div>
          {note && (
            <p className="border-t border-line px-4 py-2.5 text-xs text-ink-muted">{note}</p>
          )}
        </section>
      </aside>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
