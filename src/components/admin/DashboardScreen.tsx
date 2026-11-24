"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { getDashboard } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { todayKst } from "@/lib/date";
import type { Dashboard, IsoDate } from "@/types/api";

import DashboardView from "./DashboardView";
import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "./hooks/use-slow-notice";
import { redirectToLogin } from "./lib/redirect-to-login";

/** 불러온 시각을 함께 둔다 — D-day · "n분 전" 은 이 시각 기준 (렌더 중에 시계를 읽지 않는다) */
type LoadResult =
  | { key: string; ok: true; data: Dashboard; today: IsoDate; now: Date }
  | { key: string; ok: false; message: string };

/**
 * A-00 대시보드 (IA 2-2 "콘텐츠별 건수, 모집 상태 요약, 바로가기").
 * GET /api/admin/dashboard 한 번으로 모집 상태 · 건수 · 다가오는 일정 3건 · 최근 수정 5건을 받는다 (명세 3-6).
 * 여기서는 불러오기 · 로딩 · 에러만 맡고, 화면은 DashboardView 가 그린다.
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
      (data) => setResult({ key: requestKey, ok: true, data, today: todayKst(), now: new Date() }),
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
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!current.ok) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-6 py-12 text-center"
      >
        <p className="text-sm text-ink-muted">{current.message}</p>
        <Button variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }

  return <DashboardView data={current.data} today={current.today} now={current.now} />;
}
