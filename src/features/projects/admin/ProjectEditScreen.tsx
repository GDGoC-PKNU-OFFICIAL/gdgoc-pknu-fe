"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { redirectToLogin } from "@/components/admin/lib/redirect-to-login";
import Button, { buttonStyles } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_ROUTES } from "@/constants/routes";
import { getAdminProject } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import type { Project } from "@/types/api";

import ProjectForm from "./ProjectForm";

type LoadResult =
  | { key: string; ok: true; project: Project }
  | { key: string; ok: false; notFound: boolean; message: string };

/** A-13 수정 — 단건을 불러온 뒤 같은 폼에 채운다 (명세 2-4 "수정 폼 초기값용") */
export default function ProjectEditScreen({ id }: { id: number }) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const requestKey = `${id}#${reloadCount}`;
  const current = result?.key === requestKey ? result : null;
  const slow = useSlowNotice(current === null);

  useEffect(() => {
    const controller = new AbortController();
    getAdminProject(id, controller.signal).then(
      (project) => setResult({ key: requestKey, ok: true, project }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          redirectToLogin(error.code === "TOKEN_EXPIRED");
          return;
        }
        setResult({
          key: requestKey,
          ok: false,
          notFound: error instanceof ApiError && error.status === 404,
          message: error instanceof ApiError ? error.message : "프로젝트를 불러오지 못했습니다.",
        });
      },
    );
    return () => controller.abort();
  }, [id, requestKey]);

  if (current === null) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <p className="min-h-5 text-sm text-ink-muted">
          {slow ? SLOW_NOTICE_MESSAGE : <span className="sr-only">불러오는 중</span>}
        </p>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!current.ok) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
      >
        <p className="text-sm text-ink-muted">
          {current.notFound
            ? "요청한 프로젝트를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다."
            : current.message}
        </p>
        <div className="flex gap-2">
          {!current.notFound && (
            <Button variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>
              다시 시도
            </Button>
          )}
          <Link href={ADMIN_ROUTES.projects} className={buttonStyles({ variant: "secondary" })}>
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // key: 다시 불러오면 폼 상태(기본값 · 임시 저장 확인)를 새로 시작한다
  return <ProjectForm key={current.project.updatedAt} project={current.project} />;
}
