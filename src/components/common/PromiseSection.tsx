import Link from "next/link";

import SectionHeader from "@/components/common/SectionHeader";
import { PROMISES, type PromisePage, type PromiseSet } from "@/data/promises";

interface PromiseSectionProps {
  /** 어느 페이지의 약속인지 (IA 5-6). 내용은 src/data/promises.ts 에서 가져온다 */
  page: PromisePage;
}

/** 약속 섹션 C-07 — 각 공개 페이지 하단. About 에서는 동아리 강령 전문이 된다. */
export default function PromiseSection({ page }: PromiseSectionProps) {
  // 홈만 link, About 만 anchorId 를 가진다 → 공통 타입으로 넓혀 읽는다
  const promise: PromiseSet = PROMISES[page];
  const titleId = `promise-${page}-title`;

  return (
    <section
      id={promise.anchorId}
      aria-labelledby={titleId}
      className="border-t border-line bg-surface-muted"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8">
        <SectionHeader badge={promise.badge} title={promise.title} titleId={titleId} />
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promise.items.map((item, index) => (
            <li key={item.title} className="flex gap-4 rounded-2xl bg-surface p-6">
              <span aria-hidden="true" className="text-lg font-bold text-brand-blue tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold break-keep">{item.title}</h3>
                <p className="text-sm break-keep text-ink-muted">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
        {promise.link && (
          <Link
            href={promise.link.href}
            className="inline-flex min-h-11 items-center self-start text-sm font-medium text-brand-blue hover:underline"
          >
            {promise.link.label} →
          </Link>
        )}
      </div>
    </section>
  );
}
