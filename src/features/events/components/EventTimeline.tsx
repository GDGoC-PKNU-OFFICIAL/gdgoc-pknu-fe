import { type CSSProperties } from "react";

import EmptyState from "@/components/common/EmptyState";
import RevealOnScroll from "@/components/common/RevealOnScroll";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { EventItem, IsoDate } from "@/types/api";

import { EVENT_CATEGORY_STYLES, formatEventDate, WEEKDAY_LABELS } from "../lib/event-labels";

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

/**
 * 일정 내용. align 을 주면(데스크톱 좌우 타임라인) 테두리 없는 글로 그 쪽에 붙이고,
 * 없으면(모바일) 테두리 카드로 그린다.
 */
function EventBody({ event, align }: { event: EventItem; align?: "left" | "right" }) {
  const meta = [event.time, event.place].filter(Boolean).join(" · ");
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5",
        !align && "gap-2 rounded-2xl border border-line bg-surface p-5",
        align === "right" && "items-end text-right",
      )}
    >
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
 * 데스크톱 · 태블릿: 가운데 세로선 좌우로 번갈아 놓인 날짜 · 내용. 모바일: 왼쪽 세로선 옆에 날짜 · 카드.
 * 두 모양 중 하나만 보이고(display: none), 숨은 쪽은 화면 읽기 프로그램에도 읽히지 않는다.
 */
export default function EventTimeline({ events, emptyMessage }: EventTimelineProps) {
  if (events.length === 0) return <EmptyState message={emptyMessage} />;

  const last = events.length - 1;

  // 스크롤해서 화면에 들어오면 가까운 일정부터 0.1초 간격으로 하나씩 떠오른다 — 처음 한 번만 (RevealOnScroll)
  const reveal = (index: number) => ({
    "data-reveal-item": true,
    style: { "--reveal-order": index } as CSSProperties,
  });

  return (
    <RevealOnScroll>
      {/*
        태블릿 · 데스크톱: 가운데 세로선을 따라 일정이 왼쪽 · 오른쪽으로 번갈아 놓인다.
        날짜에서 가는 가로선이 세로선 위의 점까지 이어지고, 내용은 날짜 아래에 같은 쪽으로 붙는다.
        옆 일정은 반대쪽이라 겹치지 않으므로 위로 당겨(-mt) 엇갈리게 촘촘히 쌓는다.
      */}
      <ol className="relative hidden md:flex md:flex-col">
        <span
          aria-hidden="true"
          className="absolute top-4 bottom-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-brand-blue/30"
        />
        {events.map((event, index) => {
          const left = index % 2 === 0;
          const nearest = index === 0;
          return (
            <li
              key={event.id}
              {...reveal(index)}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_0.875rem_minmax(0,1fr)]",
                index > 0 && "-mt-8",
              )}
            >
              <div
                className={cn(
                  "flex flex-col gap-2",
                  left ? "col-start-1 items-end text-right" : "col-start-3 items-start",
                )}
              >
                {/* 날짜 ── 점 (오른쪽 일정은 점 ── 날짜) */}
                <div
                  className={cn(
                    "flex h-8 w-full items-center justify-end gap-3",
                    !left && "flex-row-reverse",
                  )}
                >
                  <DateHead event={event} nearest={nearest} />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px w-16 shrink-0 lg:w-28",
                      nearest ? "bg-brand-blue" : "bg-brand-blue/40",
                    )}
                  />
                </div>
                <div className={cn("max-w-sm", left ? "pr-16 lg:pr-28" : "pl-16 lg:pl-28")}>
                  <EventBody event={event} align={left ? "right" : "left"} />
                </div>
              </div>
              <div className="col-start-2 row-start-1 flex h-8 items-center">
                <Dot nearest={nearest} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* 모바일: 세로 타임라인 */}
      <ol className="flex flex-col md:hidden">
        {events.map((event, index) => (
          <li key={event.id} {...reveal(index)} className="relative flex gap-4 pb-6 last:pb-0">
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
    </RevealOnScroll>
  );
}
