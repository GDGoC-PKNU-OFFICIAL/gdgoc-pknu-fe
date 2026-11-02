import { type ReactNode } from "react";

import Badge from "@/components/ui/Badge";
import { formatMonthPeriod } from "@/lib/date";
import type { Study } from "@/types/api";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-10 shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-keep">{children}</dd>
    </div>
  );
}

/**
 * 스터디 카드 (C-03, IA 5-3). 서버 컴포넌트다.
 * 상세 카드가 없어 카드에서 핵심 정보를 모두 보여 주고, 결과물 링크만 클릭할 수 있다.
 */
export default function StudyCard({ study }: { study: Study }) {
  const { topic, title, summary, period, leader, participants, format, outputs } = study;

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <Badge tone="green" className="self-start">
        {topic}
      </Badge>
      <h3 className="line-clamp-2 text-lg font-semibold break-keep">{title}</h3>
      <p className="line-clamp-2 text-sm break-keep text-ink-muted">{summary}</p>

      <dl className="mt-auto flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
        <Row label="기간">
          <span className="tabular-nums">{formatMonthPeriod(period)}</span>
        </Row>
        <Row label="리더">{leader}</Row>
        <Row label="인원">{1 + participants.length}명</Row>
        {format && <Row label="방식">{format}</Row>}
      </dl>

      {outputs.length > 0 && (
        <ul aria-label="결과물" className="flex flex-col border-t border-line pt-1">
          {outputs.map(({ label, url }) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
              >
                {label} <span aria-hidden="true">↗</span>
                <span className="sr-only">(새 탭)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
