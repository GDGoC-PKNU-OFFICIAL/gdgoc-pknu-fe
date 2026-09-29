"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import type { Project } from "@/types/api";

import { PROJECT_THUMB_TRANSITION_NAME } from "../lib/project-labels";
import {
  isOpenedFromList,
  PROJECT_QUERY,
  pushFromList,
  replaceUrl,
  urlWithQuery,
} from "../lib/project-query";

import ProjectDetailOverlay from "./ProjectDetailOverlay";

/**
 * 여는 전환이 상세 카드가 열리기를 기다리는 최대 시간. 넘기면 기다리지 않고 진행한다.
 * 브라우저 자체 제한(수 초)보다 짧게 둬 화면이 멈춘 것처럼 보이지 않게 한다.
 */
const OPEN_TRANSITION_TIMEOUT_MS = 500;

interface ProjectDetailControllerProps {
  /** /projects 의 전체 목록 — ?project= slug 를 여기서 찾는다 */
  projects: Project[];
}

/**
 * ?project= 쿼리 ↔ 상세 카드(C-08) 연결 (IA 6-3, FRONT_ARCHITECTURE § 5-3).
 *
 * | 상황                   | 열 때            | 닫기 버튼 · ESC                  | 브라우저 뒤로 가기 |
 * | 목록에서 "자세히 보기"   | push + 표시 남김  | history.back()                   | 상세만 닫힘       |
 * | 공유 링크로 바로 진입    | (추가 없음)       | replace 로 project 쿼리만 제거      | 이전 사이트       |
 *
 * "자세히 보기"는 ProjectCard 의 평범한 링크다. 이 컴포넌트가 문서의 클릭을 캡처 단계에서 가로채므로
 * 카드는 서버 컴포넌트로 남는다. 새 탭 열기(Ctrl · ⌘ · Shift · 가운데 클릭)는 가로채지 않는다.
 * useSearchParams 를 쓰므로 page.tsx 에서 Suspense 로 감싼다 (fallback 없음 — 닫힌 상태가 기본).
 */
export default function ProjectDetailController({ projects }: ProjectDetailControllerProps) {
  const slug = useSearchParams().get(PROJECT_QUERY);
  const project = slug === null ? null : (projects.find((p) => p.slug === slug) ?? null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  /** 여는 전환이 "상세 카드가 열렸다"를 기다리는 동안의 resolve 함수 */
  const resolveOpenedRef = useRef<(() => void) | null>(null);
  /** 우리가 닫기를 진행 중인지 — <dialog> close 이벤트에서 URL 을 한 번 더 바꾸지 않게 */
  const closingRef = useRef(false);
  /** 닫힌 뒤 포커스를 돌려줄 카드 slug */
  const lastSlugRef = useRef<string | null>(null);

  // 없는 slug → 상세를 열지 않고 URL 에서 제거 (IA 6-1, replace)
  useEffect(() => {
    if (slug !== null && project === null) replaceUrl(urlWithQuery({ [PROJECT_QUERY]: null }));
  }, [slug, project]);

  // URL → <dialog> 동기화. 그리기 전에(layout effect) 열어야 여는 전환이 열린 화면을 찍는다
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project) {
      lastSlugRef.current = project.slug;
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close(); // 브라우저 뒤로 가기 등으로 쿼리가 사라졌을 때
    }
    resolveOpenedRef.current?.();
    resolveOpenedRef.current = null;
  }, [project]);

  const openFromList = useCallback((nextSlug: string) => {
    const navigate = () => pushFromList(urlWithQuery({ [PROJECT_QUERY]: nextSlug }));
    const thumb = findCardThumb(nextSlug);
    if (!thumb || !canAnimate()) {
      navigate();
      return;
    }

    // 카드 썸네일(시작) → 상세 썸네일(도착)이 같은 이름을 넘겨받으며 커진다. 한 화면에 같은 이름은 하나만.
    thumb.style.viewTransitionName = PROJECT_THUMB_TRANSITION_NAME;
    const transition = document.startViewTransition(() => {
      thumb.style.viewTransitionName = "";
      const opened = new Promise<void>((resolve) => {
        resolveOpenedRef.current = resolve;
      });
      navigate();
      return Promise.race([opened, delay(OPEN_TRANSITION_TIMEOUT_MS)]);
    });
    transition.finished.finally(() => {
      thumb.style.viewTransitionName = "";
    });
  }, []);

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    closingRef.current = true;

    const thumb = lastSlugRef.current ? findCardThumb(lastSlugRef.current) : null;
    if (!thumb || !canAnimate()) {
      dialog.close();
      leaveDetailUrl();
      return;
    }

    const transition = document.startViewTransition(() => {
      thumb.style.viewTransitionName = PROJECT_THUMB_TRANSITION_NAME;
      dialog.close();
    });
    // 닫힌 화면을 찍은 뒤에 URL 을 바꾼다 — 먼저 바꾸면 뒤로 가기 처리와 순서가 엉킬 수 있다
    transition.updateCallbackDone.finally(leaveDetailUrl);
    transition.finished.finally(() => {
      thumb.style.viewTransitionName = "";
    });
  }, []);

  const handleClosed = useCallback(() => {
    // 브라우저가 ESC 막기를 무시하고 직접 닫은 경우 등: URL 에 쿼리가 남아 있으면 정리한다
    const stillInUrl = new URLSearchParams(window.location.search).has(PROJECT_QUERY);
    if (!closingRef.current && stillInUrl) leaveDetailUrl();
    closingRef.current = false;

    // 연 카드의 "자세히 보기"로 포커스를 돌려준다 (다른 연도라 화면에 없으면 생략)
    const trigger = lastSlugRef.current ? findDetailLink(lastSlugRef.current) : null;
    trigger?.focus();
  }, []);

  // "자세히 보기" 클릭 가로채기. 캡처 단계라 next/link 보다 먼저 받고, preventDefault 하면 Link 는 이동하지 않는다
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-project-detail]");
      const nextSlug = link?.dataset.projectDetail;
      if (!nextSlug) return;
      event.preventDefault();
      openFromList(nextSlug);
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [openFromList]);

  return (
    <ProjectDetailOverlay
      ref={dialogRef}
      project={project}
      onRequestClose={requestClose}
      onClose={handleClosed}
    />
  );
}

/** 상세 카드를 닫을 때의 URL 처리 (IA 6-3): 목록에서 열었으면 back, 공유 링크 진입이면 쿼리만 제거 */
function leaveDetailUrl(): void {
  if (isOpenedFromList()) window.history.back();
  else replaceUrl(urlWithQuery({ [PROJECT_QUERY]: null }));
}

/** View Transitions 미지원 브라우저 · "모션 줄이기" 설정이면 애니메이션 없이 즉시 전환 (PRD 3-3-D) */
function canAnimate(): boolean {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function findCardThumb(slug: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-project-thumb="${CSS.escape(slug)}"]`);
}

function findDetailLink(slug: string): HTMLAnchorElement | null {
  return document.querySelector<HTMLAnchorElement>(`a[data-project-detail="${CSS.escape(slug)}"]`);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
