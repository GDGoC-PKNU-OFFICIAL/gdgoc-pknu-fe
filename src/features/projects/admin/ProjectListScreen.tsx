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
import { CONTENT_STATUS_LABELS, PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { ADMIN_ROUTES } from "@/constants/routes";
import { deleteProject, getAdminProjects } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { parseYearMonth } from "@/lib/date";
import { CONTENT_STATUSES, PROJECT_CATEGORIES, type Project } from "@/types/api";
import type { Page } from "@/types/common";

import {
  hasActiveFilters,
  parseProjectListState,
  PROJECT_SORTS,
  type ProjectListState,
  toProjectListQuery,
  toProjectListSearch,
} from "./project-list-query";
import ProjectTable from "./ProjectTable";

const STATUS_OPTIONS = CONTENT_STATUSES.map((value) => ({
  value,
  label: CONTENT_STATUS_LABELS[value],
}));
const CATEGORY_OPTIONS = PROJECT_CATEGORIES.map((value) => ({
  value,
  label: PROJECT_CATEGORY_LABELS[value],
}));

type LoadResult =
  { key: string; ok: true; page: Page<Project> } | { key: string; ok: false; message: string };

/**
 * A-11 프로젝트 목록 (IA 8-3). 검색 · 필터 · 정렬 · 페이지는 URL 쿼리에 두고, 데이터는 BFF 로 가져온다.
 * 결과를 요청 키(쿼리 + 새로고침 횟수)와 함께 저장해, 키가 바뀌면 이전 결과 대신 로딩을 보여 준다.
 */
export default function ProjectListScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = parseProjectListState(searchParams);
  const currentYearMonth = useCurrentYearMonth();

  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const { run, pending: deleting } = useAdminMutation();

  const search = toProjectListSearch(state);
  const requestKey = `${search}#${reloadCount}`;
  // 지금 조건의 결과가 아니면(조건을 바꾼 직후) 이전 결과 대신 로딩을 보여 준다
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;
  const slow = useSlowNotice(loading);

  useEffect(() => {
    const controller = new AbortController();
    const query = toProjectListQuery(
      parseProjectListState(new URLSearchParams(search)),
      ADMIN_LIST_PAGE_SIZE,
    );
    getAdminProjects(query, controller.signal).then(
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
  function update(changes: Partial<ProjectListState>) {
    const next = { ...state, page: 0, ...changes };
    router.replace(`${pathname}${toProjectListSearch(next)}`, { scroll: false });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const deleted = await run(() => deleteProject(target.id), { successMessage: "삭제했습니다." });
    if (!deleted.ok) return;
    removeDraft(draftKey("projects", target.id));
    setDeleteTarget(null);
    // 마지막 페이지의 마지막 항목을 지웠으면 앞 페이지로
    const shown = current?.ok ? current.page.items.length : 0;
    if (shown === 1 && state.page > 0) update({ page: state.page - 1 });
    else setReloadCount((count) => count + 1);
  }

  const currentYear = currentYearMonth ? parseYearMonth(currentYearMonth).year : null;
  const yearOptions = adminYears(currentYear, state.year).map((year) => ({
    value: String(year),
    label: `${year}년`,
  }));

  return (
    <div className="flex flex-col gap-5">
      <ListToolbar
        searchLabel="프로젝트 제목 검색"
        searchPlaceholder="제목으로 검색"
        query={state.q}
        onSearch={(q) => update({ q })}
      >
        <Select
          aria-label="상태"
          placeholder="상태 전체"
          options={STATUS_OPTIONS}
          value={state.status}
          onChange={(e) => update({ status: e.target.value as ProjectListState["status"] })}
          className="w-auto"
        />
        <Select
          aria-label="유형"
          placeholder="유형 전체"
          options={CATEGORY_OPTIONS}
          value={state.category}
          onChange={(e) => update({ category: e.target.value as ProjectListState["category"] })}
          className="w-auto"
        />
        <Select
          aria-label="시작 연도"
          placeholder="연도 전체"
          options={yearOptions}
          value={state.year === null ? "" : String(state.year)}
          onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : null })}
          className="w-auto"
        />
        <Select
          aria-label="정렬"
          options={PROJECT_SORTS}
          value={state.sort}
          onChange={(e) => update({ sort: e.target.value as ProjectListState["sort"] })}
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
            </p>
            <ProjectTable projects={current.page.items} onDelete={setDeleteTarget} />
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
  state: ProjectListState;
  totalItems: number;
  onFirstPage: () => void;
}

/** 0건 (IA 8-3 "등록된 {항목}이 없습니다" + 새로 등록). 조건 · 페이지 때문에 비었으면 그 사실을 알려 준다 */
function EmptyList({ state, totalItems, onFirstPage }: EmptyListProps) {
  if (totalItems > 0) {
    return (
      <EmptyState
        message="이 페이지에는 프로젝트가 없습니다."
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
        message="조건에 맞는 프로젝트가 없습니다."
        action={
          <Link href={ADMIN_ROUTES.projects} className={buttonStyles({ variant: "secondary" })}>
            조건 초기화
          </Link>
        }
        className="bg-surface"
      />
    );
  }
  return (
    <EmptyState
      message="등록된 프로젝트가 없습니다"
      action={
        <Link href={ADMIN_ROUTES.projectsNew} className={buttonStyles()}>
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
