"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { RULES } from "@/data/rules";
import { isOpenedFromList, pushFromList, replaceUrl, urlWithQuery } from "@/lib/url-query";

import { RULE_QUERY } from "../lib/rule-query";

import RuleDetailOverlay from "./RuleDetailOverlay";

/**
 * ?rule= 쿼리 ↔ 활동 규칙 상세 카드 연결. 스터디 상세(StudyDetailController)와 같은 규칙이다.
 * - 블록 클릭: push + 표시 남김 → 닫으면 history.back()
 * - 공유 링크로 바로 진입: 닫으면 rule 쿼리만 replace 로 제거
 * 블록은 평범한 링크이고, 문서 클릭을 캡처 단계에서 가로채 페이지 이동 없이 연다 (새 탭 열기는 그대로).
 * useSearchParams 를 쓰므로 page.tsx 에서 Suspense 로 감싼다.
 */
export default function RuleDetailController() {
  const slug = useSearchParams().get(RULE_QUERY);
  const doc = slug === null ? null : (RULES.items.find((item) => item.slug === slug) ?? null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const lastSlugRef = useRef<string | null>(null);

  // 없는 slug → 열지 않고 URL 에서 제거
  useEffect(() => {
    if (slug !== null && doc === null) replaceUrl(urlWithQuery({ [RULE_QUERY]: null }));
  }, [slug, doc]);

  // URL → <dialog> 동기화
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (doc) {
      lastSlugRef.current = doc.slug;
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [doc]);

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    closingRef.current = true;
    dialog.close();
    leaveDetailUrl();
  }, []);

  const handleClosed = useCallback(() => {
    const stillInUrl = new URLSearchParams(window.location.search).has(RULE_QUERY);
    if (!closingRef.current && stillInUrl) leaveDetailUrl();
    closingRef.current = false;

    // 연 블록으로 포커스를 돌려준다
    const slugToFocus = lastSlugRef.current;
    const trigger = slugToFocus
      ? document.querySelector<HTMLAnchorElement>(
          `a[data-rule-detail="${CSS.escape(slugToFocus)}"]`,
        )
      : null;
    trigger?.focus();
  }, []);

  // 블록 클릭 가로채기 (캡처 단계라 next/link 보다 먼저 받는다)
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-rule-detail]");
      const nextSlug = link?.dataset.ruleDetail;
      if (!nextSlug) return;
      event.preventDefault();
      pushFromList(urlWithQuery({ [RULE_QUERY]: nextSlug }));
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <RuleDetailOverlay
      ref={dialogRef}
      doc={doc}
      onRequestClose={requestClose}
      onClose={handleClosed}
    />
  );
}

/** 닫을 때의 URL 처리: 블록에서 열었으면 back, 공유 링크 진입이면 쿼리만 제거 */
function leaveDetailUrl(): void {
  if (isOpenedFromList()) window.history.back();
  else replaceUrl(urlWithQuery({ [RULE_QUERY]: null }));
}
