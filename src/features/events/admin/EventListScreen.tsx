"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useCurrentYearMonth } from "@/components/admin/hooks/use-current-year-month";
import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { draftKey, removeDraft } from "@/components/admin/lib/draft-storage";
import { redirectToLogin } from "@/components/admin/lib/redirect-to-login";
import { adminYears } from "@/components/admin/lib/year-options";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/common/EmptyState";
import Button, { buttonStyles } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_LIST_PAGE_SIZE } from "@/constants/config";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { ADMIN_ROUTES } from "@/constants/routes";
import { deleteEvent, getAdminEvents, reorderEvents } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { parseYearMonth } from "@/lib/date";
import { EVENT_CATEGORIES, type EventItem } from "@/types/api";
import type { Page } from "@/types/common";

import {
  canReorder,
  EVENT_SORTS,
  type EventListState,
  hasActiveFilters,
  parseEventListState,
  toEventListQuery,
  toEventListSearch,
} from "./event-list-query";
import { loadDayIds, moveId } from "./event-order";
import EventTable from "./EventTable";

const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((value) => ({
  value,
  label: EVENT_CATEGORY_LABELS[value],
}));

const MESSAGES = {
  reordered: "순서를 변경했습니다.",
  // 다른 관리자가 그사이 같은 날 일정을 추가 · 삭제했을 수 있다
  reorderStale: "일정이 바뀌어 순서를 저장하지 못했습니다. 목록을 새로 불러왔습니다.",
} as const;

type LoadResult =
  { key: string; ok: true; page: Page<EventItem> } | { key: string; ok: false; message: string };

/**
 * A-31 일정 목록 (IA 8-3). 검색 · 필터 · 정렬 · 페이지는 URL 쿼리에 두고, 데이터는 BFF 로 가져온다.
 * 같은 날 일정이 2건 이상이면 ↑↓ 로 순서를 바꾸고 바로 저장한다 (PUT /events/order).
 */
export default function EventListScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = parseEventListState(searchParams);
  const currentYearMonth = useCurrentYearMonth();

  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const { run, pending: deleting } = useAdminMutation();
  const reorder = useAdminMutation();

  const search = toEventListSearch(state);
  const requestKey = `${search}#${reloadCount}`;
  // 지금 조건의 결과가 아니면(조건을 바꾼 직후) 이전 결과 대신 로딩을 보여 준다
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;
  const slow = useSlowNotice(loading);

  useEffect(() => {
    const controller = new AbortController();
    const query = toEventListQuery(
      parseEventListState(new URLSearchParams(search)),
      ADMIN_LIST_PAGE_SIZE,
    );
    getAdminEvents(query, controller.signal).then(
      (page) => setResult({ key: requestKey, ok: true, page }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          redirectToLogin(error.code === "TOKEN_EXPIRED");
          return;
        }
        const message = error instanceof ApiError ? error.message : "목록을 불러오지 못했습니다.";
        setResult({ key: requestKey, ok: false, message });
      },
    );
    return () => controller.abort();
  }, [search, requestKey]);

  /** 조건을 바꾸면 첫 페이지로. 히스토리는 쌓지 않는다 */
  function update(changes: Partial<EventListState>) {
    const next = { ...state, page: 0, ...changes };
    router.replace(`${pathname}${toEventListSearch(next)}`, { scroll: false });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const deleted = await run(() => deleteEvent(target.id), { successMessage: "삭제했습니다." });
    if (!deleted.ok) return;
    removeDraft(draftKey("events", target.id));
    setDeleteTarget(null);
    // 마지막 페이지의 마지막 항목을 지웠으면 앞 페이지로
    const shown = current?.ok ? current.page.items.length : 0;
    if (shown === 1 && state.page > 0) update({ page: state.page - 1 });
    else setReloadCount((count) => count + 1);
  }

  /** 같은 날 순서 변경 — 그 날짜의 id 전체를 서버에서 다시 읽어 옮긴 뒤 저장한다 (event-order.ts) */
  async function moveEvent(event: EventItem, delta: -1 | 1) {
    setMovingId(event.id);
    await reorder.run(
      async () => {
        const ids = await loadDayIds(event.date);
        const orderedIds = moveId(ids, event.id, delta);
        if (orderedIds) await reorderEvents({ date: event.date, orderedIds });
      },
      {
        successMessage: MESSAGES.reordered,
        onError: (error) => (error.status === 400 ? MESSAGES.reorderStale : undefined),
      },
    );
    setMovingId(null);
    // 실패해도 다시 불러온다 — 화면 순서를 서버와 맞춘다
    setReloadCount((count) => count + 1);
  }

  const currentYear = currentYearMonth ? parseYearMonth(currentYearMonth).year : null;
  const yearOptions = adminYears(currentYear, state.year).map((year) => ({
    value: String(year),
    label: `${year}년`,
  }));

  return (
    <div className="flex flex-col gap-5">
      <ListToolbar
        searchLabel="일정 제목 검색"
        searchPlaceholder="제목으로 검색"
        query={state.q}
        onSearch={(q) => update({ q })}
      >
        <Select
          aria-label="카테고리"
          placeholder="카테고리 전체"
          options={CATEGORY_OPTIONS}
          value={state.category}
          onChange={(e) => update({ category: e.target.value as EventListState["category"] })}
          className="w-auto"
        />
        <Select
          aria-label="연도"
          placeholder="연도 전체"
          options={yearOptions}
          value={state.year === null ? "" : String(state.year)}
          onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : null })}
          className="w-auto"
        />
        <Select
          aria-label="정렬"
          options={EVENT_SORTS}
          value={state.sort}
          onChange={(e) => update({ sort: e.target.value as EventListState["sort"] })}
          className="w-auto"
        />
      </ListToolbar>

      <div aria-busy={loading} className="flex flex-col gap-5">
        {current === null ? (
          <ListSkeleton notice={slow ? SLOW_NOTICE_MESSAGE : null} />
        ) : !current.ok ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
          >
            <p className="text-sm text-ink-muted">{current.message}</p>
            <Button variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>
              다시 시도
            </Button>
          </div>
        ) : current.page.items.length === 0 ? (
          <EmptyList
            state={state}
            totalItems={current.page.totalItems}
            onFirstPage={() => update({})}
          />
        ) : (
          <>
            <p className="text-sm text-ink-muted">
              총 <strong className="font-semibold text-ink">{current.page.totalItems}</strong>건
              {!canReorder(state) && (
                <span className="ml-2 text-xs">
                  · 같은 날 순서 조정은 검색 · 카테고리 조건 없이 날짜 최신순일 때 할 수 있습니다.
                </span>
              )}
            </p>
            <EventTable
              events={current.page.items}
              reorderable={canReorder(state)}
              movingId={movingId}
              onMove={moveEvent}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={current.page.page}
              totalPages={current.page.totalPages}
              onChange={(page) => update({ page })}
            />
          </>
        )}
      </div>

      <DeleteConfirmDialog
        targetName={deleteTarget?.title ?? null}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

interface EmptyListProps {
  state: EventListState;
  totalItems: number;
  onFirstPage: () => void;
}

/** 0건 (IA 8-3 "등록된 {항목}이 없습니다" + 새로 등록). 조건 · 페이지 때문에 비었으면 그 사실을 알려 준다 */
function EmptyList({ state, totalItems, onFirstPage }: EmptyListProps) {
  if (totalItems > 0) {
    return (
      <EmptyState
        message="이 페이지에는 일정이 없습니다."
        action={
          <Button variant="secondary" onClick={onFirstPage}>
            첫 페이지로
          </Button>
        }
        className="bg-surface"
      />
    );
  }
  if (hasActiveFilters(state)) {
    return (
      <EmptyState
        message="조건에 맞는 일정이 없습니다."
        action={
          <Link href={ADMIN_ROUTES.events} className={buttonStyles({ variant: "secondary" })}>
            조건 초기화
          </Link>
        }
        className="bg-surface"
      />
    );
  }
  return (
    <EmptyState
      message="등록된 일정이 없습니다"
      action={
        <Link href={ADMIN_ROUTES.eventsNew} className={buttonStyles()}>
          + 새로 등록
        </Link>
      }
      className="bg-surface"
    />
  );
}

function ListSkeleton({ notice }: { notice: string | null }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="min-h-5 text-sm text-ink-muted">
        {notice ?? <span className="sr-only">불러오는 중</span>}
      </p>
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
