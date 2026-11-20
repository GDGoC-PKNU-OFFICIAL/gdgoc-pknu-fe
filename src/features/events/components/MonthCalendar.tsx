"use client";

import { type ReactNode, useMemo } from "react";

import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import { formatYearMonth, parseYearMonth } from "@/lib/date";
import { EVENT_CATEGORY_CHOICES, type EventItem, type IsoDate, type YearMonth } from "@/types/api";

import { buildCalendarMatrix, type CalendarWeek } from "../lib/build-calendar-matrix";
import { EVENT_CATEGORY_STYLES, formatEventDate, WEEKDAY_LABELS } from "../lib/event-labels";

// 달력 바탕은 "블루 틴트": 요일 줄 · 다른 달 칸 · 칸 선을 회색 대신 옅은 파랑으로 (다크는 어두운 남색 계열)

/** 한 주에 보여 줄 일정 줄 수. 넘치면 "+n" */
const MAX_LANES = 3;

/**
 * 날짜 숫자 · 일정 줄 · "+n" 줄. 일정이 없는 주도 높이가 같다.
 * 일정 줄 높이(--lane)는 화면 폭에 따라 다르다 — 모바일은 칸 폭이 좁아(약 50px) 제목을 못 읽으므로
 * 글자 없는 얇은 색 막대(0.5rem)로 그려 칸이 세로로 길쭉하게 찌그러져 보이지 않게 한다. sm 이상은 제목 막대(1.5rem).
 */
const WEEK_ROWS = `1.75rem repeat(${MAX_LANES}, var(--lane)) 1rem`;

interface MonthCalendarProps {
  events: EventItem[];
  /** 보고 있는 달. 일정 목록에서 고르면 그 일정의 달로 바뀌므로 EventsBoard 가 갖고 있다 */
  yearMonth: YearMonth;
  today: IsoDate;
  selectedEvent: EventItem | null;
  onMoveMonth: (delta: number) => void;
  onToday: () => void;
  /** 오른쪽 월 메뉴에서 고른 달로 바로 이동 */
  onPickMonth: (yearMonth: YearMonth) => void;
  onSelect: (event: EventItem) => void;
}

/** 월 메뉴 항목 1월 ~ 12월 */
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

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
  onPickMonth,
  onSelect,
}: MonthCalendarProps) {
  const { year, month } = parseYearMonth(yearMonth);
  const weeks = useMemo(
    () => buildCalendarMatrix(yearMonth, events, MAX_LANES),
    [yearMonth, events],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 툴바: [오늘] ‹ › 2026년 11월 ··· [11월 ▾] — 구글 캘린더처럼 왼쪽부터 잇고, 월 메뉴는 오른쪽 끝 */}
      <div className="flex flex-wrap items-center gap-2 py-1 sm:gap-4">
        <button
          type="button"
          onClick={onToday}
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-full border border-[#747775] px-5 text-sm font-medium text-ink dark:border-[#8e918f]",
            "transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
          )}
        >
          오늘
        </button>
        <div className="flex shrink-0 items-center">
          <ToolbarIconButton label="이전 달" onClick={() => onMoveMonth(-1)}>
            <Chevron path="M15 6l-6 6 6 6" />
          </ToolbarIconButton>
          <ToolbarIconButton label="다음 달" onClick={() => onMoveMonth(1)}>
            <Chevron path="M9 6l6 6-6 6" />
          </ToolbarIconButton>
        </div>
        <p
          aria-live="polite"
          className="text-lg whitespace-nowrap text-ink tabular-nums sm:text-[22px]"
        >
          {year}년 {month}월
        </p>

        {/* 월 메뉴: 보고 있는 해의 1~12월 중 하나를 고르면 그 달로 이동한다. 해는 ‹ › 로 넘긴다 */}
        <div className="relative ml-auto shrink-0">
          <select
            aria-label={`${year}년 중 이동할 달`}
            value={month}
            onChange={(e) => onPickMonth(formatYearMonth(year, Number(e.target.value)))}
            className={cn(
              "h-10 cursor-pointer appearance-none rounded-full border border-[#747775] bg-surface pr-10 pl-5 text-sm font-medium text-ink dark:border-[#8e918f]",
              "transition-colors hover:border-brand-blue",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
            )}
          >
            {MONTHS.map((m) => (
              // 펼친 목록도 흰 바탕(다크는 어두운 바탕) — 브라우저 기본 회색을 쓰지 않는다
              <option key={m} value={m} className="bg-surface text-ink">
                {m}월
              </option>
            ))}
          </select>
          {/* 기본 화살표를 숨기고(appearance-none) 같은 자리에 ▾ 를 그린다 */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink"
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>

      <div
        role="group"
        aria-label={`${year}년 ${month}월 달력`}
        className="overflow-hidden rounded-2xl border border-[#e1e9f7] bg-surface dark:border-[#26314a]"
      >
        <div
          aria-hidden="true"
          className="grid grid-cols-7 bg-[#eaf1fe] text-xs font-semibold text-[#3c64b4] dark:bg-[#1a2438] dark:text-[#9fbcf5]"
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
        {EVENT_CATEGORY_CHOICES.map((category) => (
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

/** 툴바의 둥근 아이콘 버튼 (이전 · 다음 달) */
function ToolbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-ink",
        "transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15",
        "focus-visible:outline-2 focus-visible:outline-brand-blue",
      )}
    >
      {children}
    </button>
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
    <div
      className="grid grid-cols-7 border-t border-[#e1e9f7] [--lane:0.5rem] sm:[--lane:1.5rem] dark:border-[#26314a]"
      style={{ gridTemplateRows: WEEK_ROWS }}
    >
      {week.days.map(({ date, day, inMonth }, column) => (
        <div
          key={date}
          style={{ gridColumn: column + 1, gridRow: "1 / -1" }}
          className={cn(
            "border-l border-[#e1e9f7] first:border-l-0 dark:border-[#26314a]",
            !inMonth && "bg-[#f4f8ff] dark:bg-[#161d2b]",
            isSelectedDay(date, selectedEvent) && "bg-brand-blue/10",
          )}
        >
          <time
            dateTime={date}
            aria-current={date === today ? "date" : undefined}
            className={cn(
              "mt-0.5 ml-0.5 flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
              !inMonth && "text-[#9db3da] dark:text-[#5c6f93]",
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
              "z-10 mx-0.5 my-px cursor-pointer truncate text-left text-ink hover:brightness-95",
              // 모바일: 글자 없는 얇은 색 막대 / sm 이상: 왼쪽 색 띠 + 제목
              "rounded-full sm:rounded-none sm:border-l-[3px] sm:px-1 sm:text-[11px] sm:leading-[1.375rem]",
              "focus-visible:outline-2 focus-visible:outline-brand-blue",
              EVENT_CATEGORY_STYLES[event.category].bar,
              // 모바일 얇은 막대는 옅은 바탕이면 안 보이므로 진한 분류 색으로 채운다
              EVENT_CATEGORY_STYLES[event.category].mobileBar,
              !continuesBefore && "sm:rounded-l-sm",
              !continuesAfter && "sm:rounded-r-sm",
              continuesBefore && "rounded-l-none",
              continuesAfter && "rounded-r-none",
              continuesBefore && "ml-0 border-l-0",
              continuesAfter && "mr-0",
              selected && "ring-2 ring-brand-blue ring-inset",
            )}
          >
            {/* 제목은 sm 이상에서만 보인다 (모바일은 aria-label · title 로만) */}
            <span className="hidden sm:inline">{event.title}</span>
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
