"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import Button, { buttonStyles } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_RESOURCE_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { getDashboard } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/cn";
import { formatIsoDate, formatKstDateTime } from "@/lib/date";
import type { AdminResource, Dashboard, EventItem } from "@/types/api";

import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "./hooks/use-slow-notice";
import { redirectToLogin } from "./lib/redirect-to-login";

type LoadResult =
  { key: string; ok: true; data: Dashboard } | { key: string; ok: false; message: string };

const NEW_ROUTES = {
  projects: ADMIN_ROUTES.projectsNew,
  studies: ADMIN_ROUTES.studiesNew,
  events: ADMIN_ROUTES.eventsNew,
  members: ADMIN_ROUTES.membersNew,
} satisfies Record<AdminResource, string>;

function editHref(resource: AdminResource, id: number): string {
  return `${ADMIN_ROUTES[resource]}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

function eventPeriod({ date, endDate }: Pick<EventItem, "date" | "endDate">): string {
  return endDate && endDate !== date
    ? `${formatIsoDate(date)} – ${formatIsoDate(endDate)}`
    : formatIsoDate(date);
}

/** 콘텐츠별 건수 카드 — 두 숫자(현재/과거 등) + 목록 · 새로 등록 바로가기 */
function CountCard({
  resource,
  first,
  second,
}: {
  resource: AdminResource;
  first: { label: string; value: number };
  second: { label: string; value: number };
}) {
  const title = ADMIN_RESOURCE_LABELS[resource];
  return (
    <section
      aria-labelledby={`dashboard-${resource}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
    >
      <h2 id={`dashboard-${resource}`} className="text-sm font-semibold">
        {title}
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {[first, second].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link
          href={ADMIN_ROUTES[resource]}
          className={buttonStyles({ variant: "secondary", className: "flex-1" })}
        >
          목록
        </Link>
        <Link
          href={NEW_ROUTES[resource]}
          aria-label={`${title} 새로 등록`}
          className={buttonStyles({ variant: "ghost", className: "flex-1" })}
        >
          + 등록
        </Link>
      </div>
    </section>
  );
}

/**
 * A-00 대시보드 (IA 2-2 "콘텐츠별 건수, 모집 상태 요약, 바로가기").
 * GET /api/admin/dashboard 한 번으로 모집 상태 · 건수 · 다가오는 일정 3건 · 최근 수정 5건을 받는다 (명세 3-6).
 */
export default function DashboardScreen() {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const requestKey = String(reloadCount);
  const current = result?.key === requestKey ? result : null;
  const slow = useSlowNotice(current === null);

  useEffect(() => {
    const controller = new AbortController();
    getDashboard(controller.signal).then(
      (data) => setResult({ key: requestKey, ok: true, data }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          redirectToLogin(error.code === "TOKEN_EXPIRED");
          return;
        }
        const message =
          error instanceof ApiError ? error.message : "대시보드를 불러오지 못했습니다.";
        setResult({ key: requestKey, ok: false, message });
      },
    );
    return () => controller.abort();
  }, [requestKey]);

  if (current === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <p className="min-h-5 text-sm text-ink-muted">
          {slow ? SLOW_NOTICE_MESSAGE : <span className="sr-only">불러오는 중</span>}
        </p>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!current.ok) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
      >
        <p className="text-sm text-ink-muted">{current.message}</p>
        <Button variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }

  const { recruiting, counts, upcomingEvents, recentUpdates } = current.data;

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="모집 상태"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5"
      >
        <p className="flex items-center gap-3 text-sm">
          <span className="text-ink-muted">모집 상태</span>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium",
              recruiting ? "bg-brand-blue/10 text-brand-blue" : "bg-surface-muted text-ink-muted",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", recruiting ? "bg-brand-blue" : "bg-ink-muted")}
            />
            {recruiting ? "모집중" : "모집 마감"}
          </span>
        </p>
        <Link href={ADMIN_ROUTES.settings} className={buttonStyles({ variant: "secondary" })}>
          사이트 설정
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard
          resource="projects"
          first={{ label: "현재", value: counts.projects.current }}
          second={{ label: "과거", value: counts.projects.past }}
        />
        <CountCard
          resource="studies"
          first={{ label: "현재", value: counts.studies.current }}
          second={{ label: "과거", value: counts.studies.past }}
        />
        <CountCard
          resource="events"
          first={{ label: "다가오는", value: counts.events.upcoming }}
          second={{ label: "지난", value: counts.events.past }}
        />
        <CountCard
          resource="members"
          first={{ label: "코어멤버", value: counts.members.core }}
          second={{ label: "시니어", value: counts.members.senior }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="dashboard-upcoming"
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
        >
          <h2 id="dashboard-upcoming" className="text-sm font-semibold">
            다가오는 일정
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-ink-muted">예정된 일정이 없습니다.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={editHref("events", event.id)}
                    className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:text-brand-blue"
                  >
                    <span className="truncate font-medium">{event.title}</span>
                    <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                      {eventPeriod(event)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="dashboard-recent"
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
        >
          <h2 id="dashboard-recent" className="text-sm font-semibold">
            최근 수정
          </h2>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-ink-muted">아직 수정한 콘텐츠가 없습니다.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {recentUpdates.map((update) => (
                <li key={`${update.resource}-${update.id}`}>
                  <Link
                    href={editHref(update.resource, update.id)}
                    className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:text-brand-blue"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                        {ADMIN_RESOURCE_LABELS[update.resource]}
                      </span>
                      <span className="truncate font-medium">{update.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                      {formatKstDateTime(new Date(update.updatedAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
