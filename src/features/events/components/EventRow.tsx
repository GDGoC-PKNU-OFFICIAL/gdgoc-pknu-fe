import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { EventItem } from "@/types/api";

import { EVENT_CATEGORY_STYLES, formatEventDate } from "../lib/event-labels";

const ROW = "flex w-full flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 text-left";

interface EventRowProps {
  event: EventItem;
  /** 선택 중인 일정인지 (Events 페이지) */
  selected?: boolean;
  /** 있으면 눌러서 선택할 수 있다 — 캘린더가 그 일정으로 이동한다. 홈에서는 표시만 한다 */
  onSelect?: (event: EventItem) => void;
}

/** 일정 행 (C-06). 이벤트 상세 페이지가 없어 내용을 행에 모두 보여 준다 (IA 1-3) */
export default function EventRow({ event, selected = false, onSelect }: EventRowProps) {
  const { title, category, time, place, summary } = event;
  const meta = [time, place].filter(Boolean).join(" · ");

  // 버튼 안에 넣을 수 있도록 블록 요소 없이 span 으로만 구성한다
  const content = (
    <>
      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-medium tabular-nums">{formatEventDate(event)}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full", EVENT_CATEGORY_STYLES[category].dot)}
          />
          {EVENT_CATEGORY_LABELS[category]}
        </span>
      </span>
      <span className="font-semibold break-keep">{title}</span>
      {meta && <span className="text-sm break-keep text-ink-muted">{meta}</span>}
      {summary && <span className="text-sm break-keep text-ink-muted">{summary}</span>}
    </>
  );

  if (!onSelect) return <article className={ROW}>{content}</article>;

  return (
    <button
      type="button"
      data-event-id={event.id}
      aria-pressed={selected}
      onClick={() => onSelect(event)}
      className={cn(
        ROW,
        "cursor-pointer transition-[border-color,box-shadow] hover:border-brand-blue/60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        selected && "border-brand-blue ring-2 ring-brand-blue/30",
      )}
    >
      {content}
    </button>
  );
}
