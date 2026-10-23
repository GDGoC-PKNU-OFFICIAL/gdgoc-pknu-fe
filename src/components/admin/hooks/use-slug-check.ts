// src/components/admin/hooks/use-slug-check.ts
// 슬러그 중복 확인 (IA 8-4 A-12 · A-13 · A-22 · A-23 "중복 체크"). 입력이 멈춘 뒤 한 번만 서버에 묻는다.
// 저장 시점의 최종 판단은 서버다 — 확인 뒤 다른 사람이 같은 슬러그를 먼저 저장하면 409 SLUG_DUPLICATED 가 온다.

import { useEffect, useState } from "react";

import { SLUG_CHECK_DELAY_MS } from "@/constants/config";

/**
 * idle: 확인하지 않음(형식이 틀렸거나, 수정 화면에서 원래 슬러그 그대로)
 * checking: 입력 대기 · 요청 중 / error: 확인 요청 실패 (저장은 막지 않는다)
 */
export type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface UseSlugCheckOptions {
  /** false 면 묻지 않는다 */
  enabled: boolean;
  /** 사용 가능하면 true. 도메인별 API(프로젝트 · 스터디)를 호출하는 쪽이 넘긴다 */
  check: (slug: string, signal: AbortSignal) => Promise<boolean>;
}

export function useSlugCheck(slug: string, { enabled, check }: UseSlugCheckOptions): SlugStatus {
  // 결과를 슬러그와 함께 둔다 — 입력이 바뀌면 이전 결과는 자동으로 "checking" 으로 보인다
  const [result, setResult] = useState<{ slug: string; status: SlugStatus } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      check(slug, controller.signal).then(
        (available) => setResult({ slug, status: available ? "available" : "taken" }),
        (error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResult({ slug, status: "error" });
        },
      );
    }, SLUG_CHECK_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug, enabled, check]);

  if (!enabled) return "idle";
  return result?.slug === slug ? result.status : "checking";
}
