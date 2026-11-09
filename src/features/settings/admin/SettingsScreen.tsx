"use client";

import { useEffect, useState } from "react";

import { SLOW_NOTICE_MESSAGE, useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { redirectToLogin } from "@/components/admin/lib/redirect-to-login";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { getAdminSettings } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import type { SiteSetting } from "@/types/api";

import SettingsForm from "./SettingsForm";

type LoadResult =
  | { key: string; ok: true; setting: SiteSetting | null }
  | { key: string; ok: false; message: string };

/** A-50 — 설정을 불러온 뒤 폼에 채운다. 아직 저장된 설정이 없으면(404) 빈 폼으로 시작한다 */
export default function SettingsScreen() {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const requestKey = String(reloadCount);
  const current = result?.key === requestKey ? result : null;
  const slow = useSlowNotice(current === null);

  useEffect(() => {
    const controller = new AbortController();
    getAdminSettings(controller.signal).then(
      (setting) => setResult({ key: requestKey, ok: true, setting }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          redirectToLogin(error.code === "TOKEN_EXPIRED");
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setResult({ key: requestKey, ok: true, setting: null });
          return;
        }
        setResult({
          key: requestKey,
          ok: false,
          message: error instanceof ApiError ? error.message : "설정을 불러오지 못했습니다.",
        });
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
        <p className="text-sm text-ink-muted">{current.message}</p>
        <Button variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }

  return <SettingsForm setting={current.setting} />;
}
