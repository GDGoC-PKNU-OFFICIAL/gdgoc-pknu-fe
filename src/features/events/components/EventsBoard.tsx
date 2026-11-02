"use client";

import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import { CALENDAR_SECTION, SCHEDULE_SECTION } from "@/data/events";
import { useTodayKst } from "@/hooks/use-today-kst";
import type { EventItem, IsoDate } from "@/types/api";

import { splitEventsByToday } from "../lib/filter-upcoming";

import MonthCalendar from "./MonthCalendar";
import UpcomingEventList from "./UpcomingEventList";

interface EventsBoardProps {
  events: EventItem[];
  /** 페이지를 만든 시점의 오늘 (KST). 브라우저에서 실제 오늘로 다시 계산한다 */
  serverToday: IsoDate;
}

/**
 * P-04 의 캘린더 + 일정 목록. "오늘"에 따라 달라지는 두 영역을 함께 둔다.
 * 데스크톱은 좌우, 그 아래는 세로로 놓는다 (IA 5-7). 좌우 배치에서는 긴 일정 목록을 내려도 캘린더가 따라온다.
 */
export default function EventsBoard({ events, serverToday }: EventsBoardProps) {
  const today = useTodayKst(serverToday);
  const { upcoming, past } = splitEventsByToday(events, today);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:px-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-start">
      <section aria-labelledby="calendar-title" className="flex flex-col gap-8 xl:sticky xl:top-20">
        <SectionHeader
          badge={CALENDAR_SECTION.badge}
          title={CALENDAR_SECTION.title}
          titleId="calendar-title"
        />
        <MonthCalendar events={events} today={today} />
      </section>

      <section aria-labelledby="schedule-title" className="flex flex-col gap-8">
        <SectionHeader
          badge={SCHEDULE_SECTION.badge}
          title={SCHEDULE_SECTION.title}
          titleId="schedule-title"
        />
        {events.length === 0 ? (
          <EmptyState message={SCHEDULE_SECTION.empty} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold">{SCHEDULE_SECTION.upcomingTitle}</h3>
              <UpcomingEventList
                events={upcoming}
                emptyMessage={SCHEDULE_SECTION.upcomingEmpty}
                anchored
              />
            </div>
            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold">{SCHEDULE_SECTION.pastTitle}</h3>
                <UpcomingEventList events={past} emptyMessage="" anchored />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
