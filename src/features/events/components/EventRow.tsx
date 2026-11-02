import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { EventItem } from "@/types/api";

import { EVENT_CATEGORY_STYLES, eventAnchorId, formatEventDate } from "../lib/event-labels";

interface EventRowProps {
  event: EventItem;
  /** 캘린더 막대가 찾아올 앵커를 붙인다 (Events 페이지). 홈에는 캘린더가 없어 붙이지 않는다 */
  anchored?: boolean;
}

/**
 * 일정 행 (C-06). 표시만 하고 인터랙션이 없다 — 이벤트 상세 페이지가 없다 (IA 1-3).
 * 앵커로 찾아오면 테두리로 강조한다.
 */
export default function EventRow({ event, anchored = false }: EventRowProps) {
  const { title, category, time, place, summary } = event;
  const meta = [time, place].filter(Boolean).join(" · ");

  return (
    <article
      id={anchored ? eventAnchorId(event.id) : undefined}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4",
        "target:border-brand-blue target:ring-2 target:ring-brand-blue/30",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-medium tabular-nums">{formatEventDate(event)}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full", EVENT_CATEGORY_STYLES[category].dot)}
          />
          {EVENT_CATEGORY_LABELS[category]}
        </span>
      </div>
      <p className="font-semibold break-keep">{title}</p>
      {meta && <p className="text-sm break-keep text-ink-muted">{meta}</p>}
      {summary && <p className="text-sm break-keep text-ink-muted">{summary}</p>}
    </article>
  );
}
