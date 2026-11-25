import type { ReactNode } from "react";

import Link from "next/link";

import Badge, { BADGE_TEXT_CLASSES, type BadgeTone } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ADMIN_RESOURCE_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { formatIsoDate, formatKstDateTime } from "@/lib/date";
import type { AdminResource, Dashboard, EventItem, IsoDate } from "@/types/api";

const NEW_ROUTES = {
  projects: ADMIN_ROUTES.projectsNew,
  studies: ADMIN_ROUTES.studiesNew,
  events: ADMIN_ROUTES.eventsNew,
  members: ADMIN_ROUTES.membersNew,
} satisfies Record<AdminResource, string>;

/** 콘텐츠마다 한 색 — 건수 카드 아이콘 · 최근 수정 배지가 같은 색이라 한눈에 어느 쪽인지 알아본다 */
const RESOURCE_TONES = {
  projects: "blue",
  studies: "green",
  events: "yellow",
  members: "purple",
} satisfies Record<AdminResource, BadgeTone>;

/** 아이콘 바탕 (배지와 같은 연한 색, 다크 모드는 조금 진하게) */
const ICON_BG = {
  projects: "bg-brand-blue/10 dark:bg-brand-blue/20",
  studies: "bg-brand-green/10 dark:bg-brand-green/20",
  events: "bg-brand-yellow/15 dark:bg-brand-yellow/20",
  members: "bg-[#a142f4]/10 dark:bg-[#a142f4]/25",
} satisfies Record<AdminResource, string>;

/** 24 × 24 선 아이콘 경로 */
const ICON_PATHS = {
  // 폴더
  projects: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  // 펼친 책
  studies: "M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zm0 0V19",
  // 달력
  events:
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 3v4M16 3v4",
  // 사람 둘
  members:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6m1-9a3 3 0 1 0 0-6m2.5 15c0-2.4-1-4.4-2.5-5.5",
} satisfies Record<AdminResource, string>;

export function editHref(resource: AdminResource, id: number): string {
  return `${ADMIN_ROUTES[resource]}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

function eventPeriod({ date, endDate }: Pick<EventItem, "date" | "endDate">): string {
  return endDate && endDate !== date
    ? `${formatIsoDate(date)} – ${formatIsoDate(endDate)}`
    : formatIsoDate(date);
}

/** "YYYY-MM-DD" 두 날짜 사이 일수 (b - a). 날짜 문자열끼리라 시간대 영향이 없다 */
function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** 일정까지 남은 날 — "진행 중" · "오늘" · "D-3" */
function dDay(event: Pick<EventItem, "date" | "endDate">, today: IsoDate): string {
  const untilStart = daysBetween(today, event.date);
  if (untilStart > 0) return `D-${untilStart}`;
  if (untilStart === 0) return "오늘";
  return "진행 중"; // 다가오는 일정에는 진행 중(시작은 지났고 끝은 남은) 일정도 들어온다 (명세 3-6)
}

/** 수정 시각 — 하루 안이면 "n분 전 · n시간 전", 그보다 오래되면 날짜 · 시각 */
function relativeTime(iso: string, now: Date): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  return formatKstDateTime(new Date(iso));
}

function ResourceIcon({ resource, className }: { resource: AdminResource; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        ICON_BG[resource],
        BADGE_TEXT_CLASSES[RESOURCE_TONES[resource]],
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ICON_PATHS[resource]} />
      </svg>
    </span>
  );
}

/**
 * 콘텐츠별 건수 카드.
 *   [아이콘] 프로젝트          + 등록
 *   12  현재          과거 30
 *   목록 보기 →
 * 지금 신경 쓸 숫자(현재 · 다가오는 · 코어멤버)를 크게, 나머지는 작게 둔다.
 */
function CountCard({
  resource,
  primary,
  secondary,
}: {
  resource: AdminResource;
  primary: { label: string; value: number };
  secondary: { label: string; value: number };
}) {
  const title = ADMIN_RESOURCE_LABELS[resource];
  return (
    <section
      aria-labelledby={`dashboard-${resource}`}
      className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5"
    >
      <div className="flex items-center gap-3">
        <ResourceIcon resource={resource} />
        <h2 id={`dashboard-${resource}`} className="flex-1 text-base font-semibold">
          {title}
        </h2>
        <Link
          href={NEW_ROUTES[resource]}
          aria-label={`${title} 새로 등록`}
          className={buttonStyles({ variant: "secondary", className: "min-h-9 px-3 text-xs" })}
        >
          + 등록
        </Link>
      </div>

      <dl className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-ink-muted">{primary.label}</dt>
          <dd className="text-4xl leading-none font-bold tracking-tight tabular-nums">
            {primary.value}
          </dd>
        </div>
        <div className="flex flex-col items-end gap-1">
          <dt className="text-xs text-ink-muted">{secondary.label}</dt>
          <dd className="text-lg leading-none font-semibold text-ink-muted tabular-nums">
            {secondary.value}
          </dd>
        </div>
      </dl>

      <Link
        href={ADMIN_ROUTES[resource]}
        className="-mx-2 mt-auto -mb-2 flex min-h-11 items-center justify-between rounded-lg px-2 text-sm font-medium hover:bg-surface-muted"
      >
        목록 보기
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

function Panel({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-5"
    >
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
        {title}
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted tabular-nums">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

interface DashboardViewProps {
  data: Dashboard;
  /** 오늘 (KST, YYYY-MM-DD) — D-day 계산 기준 */
  today: IsoDate;
  /** 지금 — "n분 전" 계산 기준 */
  now: Date;
}

/**
 * 대시보드 화면 (데이터를 받아 그리기만 한다 — 불러오기 · 에러는 DashboardScreen).
 * 위에서부터 모집 상태 → 콘텐츠별 건수 → 다가오는 일정 · 최근 수정.
 * 콘텐츠마다 한 색(RESOURCE_TONES)을 정해 아이콘 · 배지에 같이 써서, 글을 읽지 않아도 어느 쪽인지 보인다.
 */
export default function DashboardView({ data, today, now }: DashboardViewProps) {
  const { recruiting, counts, upcomingEvents, recentUpdates } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* 모집 상태 — 사이트 맨 위 배너와 직결되는 값이라 가장 크게 */}
      <section
        aria-label="모집 상태"
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5 md:p-6",
          recruiting
            ? "border-brand-green/40 bg-brand-green/10 dark:bg-brand-green/15"
            : "border-line bg-surface",
        )}
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className={cn(
              "relative flex size-3 shrink-0 rounded-full",
              recruiting ? "bg-brand-green" : "bg-ink-muted",
            )}
          >
            {recruiting && (
              <span className="absolute inset-0 rounded-full bg-brand-green motion-safe:animate-ping" />
            )}
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold">{recruiting ? "모집 중" : "모집 마감"}</p>
            <p className="text-sm text-ink-muted">
              {recruiting
                ? "사이트 첫 화면 배너에 '모집 중'으로 보이고 있습니다."
                : "사이트 첫 화면 배너에 '모집 마감'으로 보이고 있습니다."}
            </p>
          </div>
        </div>
        <Link href={ADMIN_ROUTES.settings} className={buttonStyles({ variant: "secondary" })}>
          모집 설정 바꾸기
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard
          resource="projects"
          primary={{ label: "진행 중", value: counts.projects.current }}
          secondary={{ label: "완료", value: counts.projects.past }}
        />
        <CountCard
          resource="studies"
          primary={{ label: "진행 중", value: counts.studies.current }}
          secondary={{ label: "완료", value: counts.studies.past }}
        />
        <CountCard
          resource="events"
          primary={{ label: "다가오는", value: counts.events.upcoming }}
          secondary={{ label: "지난", value: counts.events.past }}
        />
        <CountCard
          resource="members"
          primary={{ label: "코어멤버", value: counts.members.core }}
          secondary={{ label: "시니어", value: counts.members.senior }}
        />
      </div>

      {/* grid 칸은 기본 최소 너비가 내용 크기라, 한 줄로 자르는(truncate) 긴 제목이 칸을 밀어낸다 — 각 칸에 min-w-0 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel id="dashboard-upcoming" title="다가오는 일정" count={upcomingEvents.length}>
          {upcomingEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">예정된 일정이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {upcomingEvents.map((event) => {
                const [, month, day] = event.date.split("-");
                const label = dDay(event, today);
                return (
                  <li key={event.id}>
                    <Link
                      href={editHref("events", event.id)}
                      className="-mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-muted"
                    >
                      {/* 날짜 칸 — 월 · 일을 달력처럼 */}
                      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-muted leading-none">
                        <span className="text-xs text-ink-muted">{Number(month)}월</span>
                        <span className="text-lg font-bold tabular-nums">{Number(day)}</span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold">{event.title}</span>
                        <span className="truncate text-xs text-ink-muted tabular-nums">
                          {eventPeriod(event)}
                          {event.place && ` · ${event.place}`}
                        </span>
                      </span>
                      <Badge
                        tone={
                          label === "D-1" || label === "오늘" || label === "진행 중"
                            ? "red"
                            : "neutral"
                        }
                        className="shrink-0 tabular-nums"
                      >
                        {label}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel id="dashboard-recent" title="최근 수정" count={recentUpdates.length}>
          {recentUpdates.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              아직 수정한 콘텐츠가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recentUpdates.map((update) => (
                <li key={`${update.resource}-${update.id}`}>
                  <Link
                    href={editHref(update.resource, update.id)}
                    className="-mx-2 flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-muted"
                  >
                    <Badge
                      tone={RESOURCE_TONES[update.resource]}
                      className="min-w-[4.5rem] shrink-0 justify-center whitespace-nowrap"
                    >
                      {ADMIN_RESOURCE_LABELS[update.resource]}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {update.title}
                    </span>
                    <time
                      dateTime={update.updatedAt}
                      title={formatKstDateTime(new Date(update.updatedAt))}
                      className="shrink-0 text-xs text-ink-muted tabular-nums"
                    >
                      {relativeTime(update.updatedAt, now)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
