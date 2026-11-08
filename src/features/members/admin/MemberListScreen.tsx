"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { draftKey, removeDraft } from "@/components/admin/lib/draft-storage";
import { redirectToLogin } from "@/components/admin/lib/redirect-to-login";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/common/EmptyState";
import Button, { buttonStyles } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_LIST_PAGE_SIZE } from "@/constants/config";
import { MEMBER_ROLE_LABELS, MEMBER_STATUS_LABELS } from "@/constants/labels";
import { ADMIN_ROUTES } from "@/constants/routes";
import { deleteMember, getAdminMembers } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { type AdminMember, MEMBER_ROLES, MEMBER_STATUSES } from "@/types/api";
import type { Page } from "@/types/common";

import {
  hasActiveFilters,
  MEMBER_SORTS,
  type MemberListState,
  parseMemberListState,
  toMemberListQuery,
  toMemberListSearch,
} from "./member-list-query";
import MemberTable from "./MemberTable";

const STATUS_OPTIONS = MEMBER_STATUSES.map((value) => ({
  value,
  label: MEMBER_STATUS_LABELS[value],
}));
const ROLE_OPTIONS = MEMBER_ROLES.map((value) => ({ value, label: MEMBER_ROLE_LABELS[value] }));

type LoadResult =
  { key: string; ok: true; page: Page<AdminMember> } | { key: string; ok: false; message: string };

/**
 * A-41 멤버 목록 (IA 8-3). 검색 · 필터 · 정렬 · 페이지는 URL 쿼리에 두고, 데이터는 BFF 로 가져온다.
 * 결과를 요청 키(쿼리 + 새로고침 횟수)와 함께 저장해, 키가 바뀌면 이전 결과 대신 로딩을 보여 준다.
 */
export default function MemberListScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = parseMemberListState(searchParams);

  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMember | null>(null);
  const { run, pending: deleting } = useAdminMutation();

  const search = toMemberListSearch(state);
  const requestKey = `${search}#${reloadCount}`;
  // 지금 조건의 결과가 아니면(조건을 바꾼 직후) 이전 결과 대신 로딩을 보여 준다
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;
  const slow = useSlowNotice(loading);

  useEffect(() => {
    const controller = new AbortController();
    const query = toMemberListQuery(
      parseMemberListState(new URLSearchParams(search)),
      ADMIN_LIST_PAGE_SIZE,
    );
    getAdminMembers(query, controller.signal).then(
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
  function update(changes: Partial<MemberListState>) {
    const next = { ...state, page: 0, ...changes };
    router.replace(`${pathname}${toMemberListSearch(next)}`, { scroll: false });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const deleted = await run(() => deleteMember(target.id), { successMessage: "삭제했습니다." });
    if (!deleted.ok) return;
    removeDraft(draftKey("members", target.id));
    setDeleteTarget(null);
    // 마지막 페이지의 마지막 항목을 지웠으면 앞 페이지로
    const shown = current?.ok ? current.page.items.length : 0;
    if (shown === 1 && state.page > 0) update({ page: state.page - 1 });
    else setReloadCount((count) => count + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <ListToolbar
        searchLabel="멤버 이름 검색"
        searchPlaceholder="이름으로 검색"
        query={state.q}
        onSearch={(q) => update({ q })}
      >
        <Select
          aria-label="구분"
          placeholder="구분 전체"
          options={STATUS_OPTIONS}
          value={state.status}
          onChange={(e) => update({ status: e.target.value as MemberListState["status"] })}
          className="w-auto"
        />
        <Select
          aria-label="역할"
          placeholder="역할 전체"
          options={ROLE_OPTIONS}
          value={state.role}
          onChange={(e) => update({ role: e.target.value as MemberListState["role"] })}
          className="w-auto"
        />
        <Select
          aria-label="정렬"
          options={MEMBER_SORTS}
          value={state.sort}
          onChange={(e) => update({ sort: e.target.value as MemberListState["sort"] })}
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
              총 <strong className="font-semibold text-ink">{current.page.totalItems}</strong>명
            </p>
            <MemberTable members={current.page.items} onDelete={setDeleteTarget} />
            <Pagination
              page={current.page.page}
              totalPages={current.page.totalPages}
              onChange={(page) => update({ page })}
            />
          </>
        )}
      </div>

      <DeleteConfirmDialog
        targetName={deleteTarget?.name ?? null}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

interface EmptyListProps {
  state: MemberListState;
  totalItems: number;
  onFirstPage: () => void;
}

/** 0건 (IA 8-3 "등록된 {항목}이 없습니다" + 새로 등록). 조건 · 페이지 때문에 비었으면 그 사실을 알려 준다 */
function EmptyList({ state, totalItems, onFirstPage }: EmptyListProps) {
  if (totalItems > 0) {
    return (
      <EmptyState
        message="이 페이지에는 멤버가 없습니다."
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
        message="조건에 맞는 멤버가 없습니다."
        action={
          <Link href={ADMIN_ROUTES.members} className={buttonStyles({ variant: "secondary" })}>
            조건 초기화
          </Link>
        }
        className="bg-surface"
      />
    );
  }
  return (
    <EmptyState
      message="등록된 멤버가 없습니다"
      action={
        <Link href={ADMIN_ROUTES.membersNew} className={buttonStyles()}>
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
