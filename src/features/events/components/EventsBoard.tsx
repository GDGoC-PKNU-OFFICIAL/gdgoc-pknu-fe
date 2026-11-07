"use client";

import { useRef, useState } from "react";

import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import { CALENDAR_SECTION, SCHEDULE_SECTION } from "@/data/events";
import { useTodayKst } from "@/hooks/use-today-kst";
import { shiftYearMonth } from "@/lib/date";
import type { EventItem, IsoDate, YearMonth } from "@/types/api";

import { splitEventsByToday } from "../lib/filter-upcoming";

import MonthCalendar from "./MonthCalendar";
import UpcomingEventList from "./UpcomingEventList";

/** 선택한 일정 위에 남길 여백 (px) */
const SCROLL_GAP_PX = 8;

function toYearMonth(date: IsoDate): YearMonth {
  return date.slice(0, 7).replace("-", ".");
}

interface EventsBoardProps {
  events: EventItem[];
  /** 페이지를 만든 시점의 오늘 (KST). 브라우저에서 실제 오늘로 다시 계산한다 */
  serverToday: IsoDate;
}

/**
 * P-04 의 캘린더 + 일정 목록. 선택한 일정을 두 영역이 함께 보여 준다.
 * - 캘린더에서 고르면 일정 목록 상자 안에서만 스크롤한다. 페이지는 움직이지 않는다 — 달력이 화면에서 사라지면 안 된다.
 * - 일정 목록에서 고르면 캘린더가 그 일정의 달로 이동해 표시한다.
 * 데스크톱은 좌우, 그 아래는 세로로 놓는다 (IA 5-7).
 */
export default function EventsBoard({ events, serverToday }: EventsBoardProps) {
  const today = useTodayKst(serverToday);
  const { upcoming, past } = splitEventsByToday(events, today);

  /** null 이면 이번 달 — 날짜가 바뀌면 따라간다 */
  const [pickedMonth, setPickedMonth] = useState<YearMonth | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const thisMonth = toYearMonth(today);

  function selectFromCalendar(event: EventItem) {
    setSelectedEvent(event);
    const box = scheduleRef.current;
    const row = box?.querySelector(`[data-event-id="${event.id}"]`);
    if (!box || !row) return;
    // scrollIntoView 는 페이지까지 움직이므로 쓰지 않는다. 상자의 스크롤만 옮긴다
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: top - SCROLL_GAP_PX, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function selectFromSchedule(event: EventItem) {
    setSelectedEvent(event);
    setPickedMonth(toYearMonth(event.date));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:px-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-start">
      <section aria-labelledby="calendar-title" className="flex flex-col gap-8">
        <SectionHeader
          badge={CALENDAR_SECTION.badge}
          title={CALENDAR_SECTION.title}
          titleId="calendar-title"
        />
        <MonthCalendar
          events={events}
          yearMonth={pickedMonth ?? thisMonth}
          today={today}
          selectedEvent={selectedEvent}
          onMoveMonth={(delta) =>
            setPickedMonth((month) => shiftYearMonth(month ?? thisMonth, delta))
          }
          onToday={() => setPickedMonth(null)}
          onSelect={selectFromCalendar}
        />
      </section>

      <section aria-labelledby="schedule-title" className="flex min-w-0 flex-col gap-8">
        <SectionHeader
          badge={SCHEDULE_SECTION.badge}
          title={SCHEDULE_SECTION.title}
          titleId="schedule-title"
        />
        {events.length === 0 ? (
          <EmptyState message={SCHEDULE_SECTION.empty} />
        ) : (
          <div
            ref={scheduleRef}
            tabIndex={0}
            role="region"
            aria-label="일정 목록"
            className="flex h-[28rem] flex-col gap-6 overflow-y-auto rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-brand-blue xl:h-[44rem] xl:overscroll-contain"
          >
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold">{SCHEDULE_SECTION.upcomingTitle}</h3>
              <UpcomingEventList
                events={upcoming}
                emptyMessage={SCHEDULE_SECTION.upcomingEmpty}
                selectedId={selectedEvent?.id}
                onSelect={selectFromSchedule}
              />
            </div>
            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold">{SCHEDULE_SECTION.pastTitle}</h3>
                <UpcomingEventList
                  events={past}
                  emptyMessage=""
                  selectedId={selectedEvent?.id}
                  onSelect={selectFromSchedule}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
