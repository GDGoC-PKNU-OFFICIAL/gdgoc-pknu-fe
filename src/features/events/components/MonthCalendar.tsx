"use client";

import { useMemo } from "react";

import Button from "@/components/ui/Button";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import { parseYearMonth } from "@/lib/date";
import { EVENT_CATEGORIES, type EventItem, type IsoDate, type YearMonth } from "@/types/api";

import { buildCalendarMatrix, type CalendarWeek } from "../lib/build-calendar-matrix";
import { EVENT_CATEGORY_STYLES, formatEventDate, WEEKDAY_LABELS } from "../lib/event-labels";

/** 한 주에 보여 줄 일정 줄 수. 넘치면 "+n" */
const MAX_LANES = 3;

/** 날짜 숫자 · 일정 줄 · "+n" 줄. 일정이 없는 주도 높이가 같다 */
const WEEK_ROWS = `1.75rem repeat(${MAX_LANES}, 1.5rem) 1rem`;

interface MonthCalendarProps {
  events: EventItem[];
  /** 보고 있는 달. 일정 목록에서 고르면 그 일정의 달로 바뀌므로 EventsBoard 가 갖고 있다 */
  yearMonth: YearMonth;
  today: IsoDate;
  selectedEvent: EventItem | null;
  onMoveMonth: (delta: number) => void;
  onToday: () => void;
  onSelect: (event: EventItem) => void;
}

/**
 * 월간 캘린더 (P-04 #2). 월 이동은 화면 상태라 URL 에 남기지 않는다 (IA 6-2).
 * 일정을 누르면 일정 목록에서 그 항목이 선택되고, 선택된 일정은 막대 테두리 · 날짜 칸 색으로 표시한다.
 * 카테고리 범례는 클릭되지 않는다.
 */
export default function MonthCalendar({
  events,
  yearMonth,
  today,
  selectedEvent,
  onMoveMonth,
  onToday,
  onSelect,
}: MonthCalendarProps) {
  const { year, month } = parseYearMonth(yearMonth);
  const weeks = useMemo(
    () => buildCalendarMatrix(yearMonth, events, MAX_LANES),
    [yearMonth, events],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p aria-live="polite" className="text-lg font-bold tabular-nums">
          {year}년 {month}월
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="이전 달" onClick={() => onMoveMonth(-1)}>
            <Chevron path="M15 6l-6 6 6 6" />
          </Button>
          <Button variant="secondary" onClick={onToday}>
            오늘
          </Button>
          <Button variant="ghost" size="icon" aria-label="다음 달" onClick={() => onMoveMonth(1)}>
            <Chevron path="M9 6l6 6-6 6" />
          </Button>
        </div>
      </div>

      <div
        role="group"
        aria-label={`${year}년 ${month}월 달력`}
        className="overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div
          aria-hidden="true"
          className="grid grid-cols-7 bg-surface-muted text-xs text-ink-muted"
        >
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-2 text-center">
              {label}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <Week
            key={week.days[0].date}
            week={week}
            today={today}
            selectedEvent={selectedEvent}
            onSelect={onSelect}
          />
        ))}
      </div>

      <ul aria-label="일정 색상" className="flex flex-wrap gap-x-4 gap-y-1">
        {EVENT_CATEGORIES.map((category) => (
          <li key={category} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", EVENT_CATEGORY_STYLES[category].dot)}
            />
            {EVENT_CATEGORY_LABELS[category]}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chevron({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

interface WeekProps {
  week: CalendarWeek;
  today: IsoDate;
  selectedEvent: EventItem | null;
  onSelect: (event: EventItem) => void;
}

/** 선택한 일정이 있는 날짜인지. "+n" 에 숨은 일정도 고르면 보이도록 막대가 아니라 칸에 표시한다 */
function isSelectedDay(date: IsoDate, event: EventItem | null): boolean {
  return event !== null && date >= event.date && date <= (event.endDate ?? event.date);
}

function Week({ week, today, selectedEvent, onSelect }: WeekProps) {
  return (
    <div className="grid grid-cols-7 border-t border-line" style={{ gridTemplateRows: WEEK_ROWS }}>
      {week.days.map(({ date, day, inMonth }, column) => (
        <div
          key={date}
          style={{ gridColumn: column + 1, gridRow: "1 / -1" }}
          className={cn(
            "border-l border-line first:border-l-0",
            !inMonth && "bg-surface-muted",
            isSelectedDay(date, selectedEvent) && "bg-brand-blue/10",
          )}
        >
          <time
            dateTime={date}
            aria-current={date === today ? "date" : undefined}
            className={cn(
              "mt-0.5 ml-0.5 flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
              !inMonth && "text-ink-muted",
              date === today && "bg-brand-blue font-semibold text-white",
            )}
          >
            {day}
          </time>
        </div>
      ))}

      {week.bars.map(({ event, startColumn, span, lane, continuesBefore, continuesAfter }) => {
        const selected = event.id === selectedEvent?.id;
        return (
          <button
            key={event.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${event.title}, ${formatEventDate(event)}`}
            title={event.title}
            onClick={() => onSelect(event)}
            style={{ gridColumn: `${startColumn + 1} / span ${span}`, gridRow: lane + 2 }}
            className={cn(
              "z-10 mx-0.5 my-px cursor-pointer truncate border-l-[3px] px-1 text-left text-[11px] leading-[1.375rem] text-ink hover:brightness-95",
              "focus-visible:outline-2 focus-visible:outline-brand-blue",
              EVENT_CATEGORY_STYLES[event.category].bar,
              !continuesBefore && "rounded-l-sm",
              !continuesAfter && "rounded-r-sm",
              continuesBefore && "ml-0 border-l-0",
              continuesAfter && "mr-0",
              selected && "ring-2 ring-brand-blue ring-inset",
            )}
          >
            {event.title}
          </button>
        );
      })}

      {week.hiddenCounts.map(
        (count, column) =>
          count > 0 && (
            <span
              key={column}
              style={{ gridColumn: column + 1, gridRow: MAX_LANES + 2 }}
              className="z-10 px-1 text-[10px] leading-4 text-ink-muted"
            >
              +{count}
            </span>
          ),
      )}
    </div>
  );
}
