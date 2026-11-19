import EmptyState from "@/components/common/EmptyState";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { EventItem, IsoDate } from "@/types/api";

import { EVENT_CATEGORY_STYLES, formatEventDate, WEEKDAY_LABELS } from "../lib/event-labels";

/** 데스크톱 · 태블릿 가로 타임라인 한 줄의 일정 수. 넘치면 다음 줄로 이어진다 */
const ROW_SIZE = 3;

interface EventTimelineProps {
  /** 이미 걸러 가까운 순으로 정렬한 일정 */
  events: EventItem[];
  emptyMessage: string;
}

/** "2026-11-24" → { day: "11.24", weekday: "화" } */
function shortDate(date: IsoDate) {
  const [, month, day] = date.split("-");
  const weekday = WEEKDAY_LABELS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return { day: `${month}.${day}`, weekday };
}

/** 타임라인 머리의 날짜. 여러 날 일정은 "11.24 – 11.26" */
function DateHead({ event, nearest }: { event: EventItem; nearest: boolean }) {
  const start = shortDate(event.date);
  const end = event.endDate && event.endDate !== event.date ? shortDate(event.endDate) : null;
  return (
    <p className="flex items-baseline gap-1.5">
      <time
        dateTime={event.date}
        className={cn(
          "font-nav text-2xl font-bold tracking-tight tabular-nums",
          nearest ? "text-brand-blue" : "text-ink",
        )}
      >
        {start.day}
        {end && ` – ${end.day}`}
      </time>
      <span className="text-sm text-ink-muted">
        ({start.weekday}
        {end && ` – ${end.weekday}`})
      </span>
    </p>
  );
}

/**
 * 타임라인 위의 점. 가장 가까운 일정은 파랗게 채우고 둘레에 옅은 고리를 둔다.
 * 그 점에서는 신호가 퍼지듯 동그란 파동 두 겹이 엇갈려 계속 번져 나간다 (animate-signal, "모션 줄이기"면 없음).
 */
function Dot({ nearest }: { nearest: boolean }) {
  return (
    <span aria-hidden="true" className="relative z-10 block size-3.5">
      {nearest && (
        <>
          <span className="absolute inset-0 rounded-full bg-brand-blue/40 motion-safe:animate-signal" />
          <span className="absolute inset-0 rounded-full bg-brand-blue/40 [animation-delay:1s] motion-safe:animate-signal" />
        </>
      )}
      <span
        className={cn(
          "relative block size-full rounded-full border-2",
          nearest
            ? "border-brand-blue bg-brand-blue ring-4 ring-brand-blue/20"
            : "border-brand-blue/60 bg-surface",
        )}
      />
    </span>
  );
}

/** 일정 내용 카드 */
function EventBody({ event }: { event: EventItem }) {
  const meta = [event.time, event.place].filter(Boolean).join(" · ");
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", EVENT_CATEGORY_STYLES[event.category].dot)}
        />
        {EVENT_CATEGORY_LABELS[event.category]}
      </span>
      <h3 className="font-semibold [overflow-wrap:anywhere] break-keep">{event.title}</h3>
      {meta && <p className="text-sm break-keep text-ink-muted">{meta}</p>}
      {event.summary && (
        <p className="line-clamp-2 text-sm [overflow-wrap:anywhere] break-keep text-ink-muted">
          {event.summary}
        </p>
      )}
      {/* 머리의 짧은 날짜는 연도가 없으므로 화면 읽기 프로그램에는 전체 날짜를 한 번 더 알린다 */}
      <span className="sr-only">{formatEventDate(event)}</span>
    </div>
  );
}

/**
 * 홈 다가오는 일정 타임라인 (P-00 #6). 가까운 일정부터 왼쪽 → 오른쪽(모바일은 위 → 아래)으로 이어진다.
 * 데스크톱 · 태블릿: 가로선 위에 날짜 · 점, 아래에 내용 카드. 모바일: 왼쪽 세로선 옆에 날짜 · 카드.
 * 두 모양 중 하나만 보이고(display: none), 숨은 쪽은 화면 읽기 프로그램에도 읽히지 않는다.
 */
export default function EventTimeline({ events, emptyMessage }: EventTimelineProps) {
  if (events.length === 0) return <EmptyState message={emptyMessage} />;

  const last = events.length - 1;
  // 한 줄에 ROW_SIZE 개씩. 일정이 그보다 적으면 그 수만큼 칸을 나눈다
  const columns = Math.min(events.length, ROW_SIZE);

  return (
    <>
      {/* 태블릿 · 데스크톱: 가로 타임라인. ROW_SIZE 개마다 다음 줄로 넘어간다 */}
      <ol
        className="hidden gap-x-6 gap-y-12 md:grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {events.map((event, index) => {
          // 줄의 마지막 칸이 아니고 다음 일정이 있으면 오른쪽으로 선을 잇는다
          const lineToNext = index < last && (index + 1) % ROW_SIZE !== 0;
          return (
            <li key={event.id} className="flex flex-col gap-4">
              <DateHead event={event} nearest={index === 0} />
              {/* 점과 가로선. 칸 사이 간격(gap-x-6)까지 선을 이어 그린다 */}
              <div className="relative flex h-4 items-center">
                {lineToNext && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-0 h-px w-[calc(100%+1.5rem)] bg-line"
                  />
                )}
                <Dot nearest={index === 0} />
              </div>
              <EventBody event={event} />
            </li>
          );
        })}
      </ol>

      {/* 모바일: 세로 타임라인 */}
      <ol className="flex flex-col md:hidden">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* 세로선: 다음 일정까지 잇는다 */}
            {index < last && (
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-0 left-[6px] w-px bg-line"
              />
            )}
            <div className="pt-2">
              <Dot nearest={index === 0} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <DateHead event={event} nearest={index === 0} />
              <EventBody event={event} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
