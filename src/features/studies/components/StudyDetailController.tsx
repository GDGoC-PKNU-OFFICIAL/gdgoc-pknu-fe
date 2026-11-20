"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import { focusWithoutRing } from "@/lib/focus";
import { isOpenedFromList, pushFromList, replaceUrl, urlWithQuery } from "@/lib/url-query";
import type { Study } from "@/types/api";

import { STUDY_QUERY } from "../lib/study-query";

import StudyDetailOverlay from "./StudyDetailOverlay";

/**
 * ?study= 쿼리 ↔ 스터디 상세 카드 연결. 프로젝트 상세(ProjectDetailController)와 같은 규칙이다.
 *
 * | 상황               | 열 때            | 닫기 버튼 · ESC                | 브라우저 뒤로 가기 |
 * | 목록에서 카드 클릭   | push + 표시 남김  | history.back()                 | 상세만 닫힘       |
 * | 공유 링크로 바로 진입 | (추가 없음)       | replace 로 study 쿼리만 제거      | 이전 사이트       |
 *
 * 카드 클릭은 StudyCard 의 평범한 링크다. 문서 클릭을 캡처 단계에서 가로채 페이지 이동 없이 연다.
 * 새 탭 열기(Ctrl · ⌘ · Shift · 가운데 클릭)는 가로채지 않는다.
 * useSearchParams 를 쓰므로 page.tsx 에서 Suspense 로 감싼다 (fallback 없음 — 닫힌 상태가 기본).
 */
export default function StudyDetailController({ studies }: { studies: Study[] }) {
  const slug = useSearchParams().get(STUDY_QUERY);
  const study = slug === null ? null : (studies.find((s) => s.slug === slug) ?? null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  /** 우리가 닫기를 진행 중인지 — <dialog> close 이벤트에서 URL 을 한 번 더 바꾸지 않게 */
  const closingRef = useRef(false);
  /** 닫힌 뒤 포커스를 돌려줄 카드 slug */
  const lastSlugRef = useRef<string | null>(null);

  // 없는 slug → 상세를 열지 않고 URL 에서 제거 (replace)
  useEffect(() => {
    if (slug !== null && study === null) replaceUrl(urlWithQuery({ [STUDY_QUERY]: null }));
  }, [slug, study]);

  // URL → <dialog> 동기화
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (study) {
      lastSlugRef.current = study.slug;
      if (!dialog.open) {
        dialog.showModal();
        trackEvent("study_detail_open", { slug: study.slug, status: study.status });
      }
    } else if (dialog.open) {
      dialog.close(); // 브라우저 뒤로 가기 등으로 쿼리가 사라졌을 때
    }
  }, [study]);

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    closingRef.current = true;
    dialog.close();
    leaveDetailUrl();
  }, []);

  const handleClosed = useCallback(() => {
    // 브라우저가 ESC 막기를 무시하고 직접 닫은 경우 등: URL 에 쿼리가 남아 있으면 정리한다
    const stillInUrl = new URLSearchParams(window.location.search).has(STUDY_QUERY);
    if (!closingRef.current && stillInUrl) leaveDetailUrl();
    closingRef.current = false;

    // 연 카드의 링크로 포커스를 돌려준다 (다른 연도라 화면에 없으면 생략)
    const slugToFocus = lastSlugRef.current;
    const trigger = slugToFocus
      ? document.querySelector<HTMLAnchorElement>(
          `a[data-study-detail="${CSS.escape(slugToFocus)}"]`,
        )
      : null;
    // 테두리(포커스 표시) 없이 돌려준다 — 마우스 사용자에게 파란 테두리가 남지 않게. Tab 을 누르면 다시 보인다
    focusWithoutRing(trigger);
  }, []);

  // 카드 클릭 가로채기. 캡처 단계라 next/link 보다 먼저 받고, preventDefault 하면 Link 는 이동하지 않는다
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-study-detail]");
      const nextSlug = link?.dataset.studyDetail;
      if (!nextSlug) return;
      event.preventDefault();
      pushFromList(urlWithQuery({ [STUDY_QUERY]: nextSlug }));
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <StudyDetailOverlay
      ref={dialogRef}
      study={study}
      onRequestClose={requestClose}
      onClose={handleClosed}
    />
  );
}

/** 상세 카드를 닫을 때의 URL 처리: 목록에서 열었으면 back, 공유 링크 진입이면 쿼리만 제거 */
function leaveDetailUrl(): void {
  if (isOpenedFromList()) window.history.back();
  else replaceUrl(urlWithQuery({ [STUDY_QUERY]: null }));
}
