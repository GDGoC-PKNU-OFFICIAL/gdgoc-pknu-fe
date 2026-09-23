"use client";

import { useRef } from "react";

import NavLinks from "@/components/layout/NavLinks";

const MENU_ID = "mobile-nav";

/**
 * 모바일(< 768px) 전체 화면 메뉴 (IA 3-2).
 * 네이티브 <dialog>.showModal() 을 써서 포커스 가두기 · ESC 닫기 · 뒤 페이지 inert 를 브라우저에 맡긴다.
 * 뒤 페이지 스크롤 잠금은 globals.css 의 body:has(dialog[open]) 가 담당한다.
 */
export default function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <div className="md:hidden">
      <button
        ref={openButtonRef}
        type="button"
        aria-label="메뉴 열기"
        aria-haspopup="dialog"
        aria-controls={MENU_ID}
        onClick={open}
        className="flex size-11 items-center justify-center rounded-full hover:bg-surface-muted"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        id={MENU_ID}
        aria-label="사이트 메뉴"
        // ESC · 링크 선택 · 닫기 버튼 어느 경로로 닫혀도 여는 버튼으로 포커스를 돌려준다
        onClose={() => openButtonRef.current?.focus()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-surface p-0 text-ink backdrop:bg-transparent"
      >
        <div className="flex h-16 items-center justify-end border-b border-line px-4">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={close}
            className="flex size-11 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="주 메뉴" className="px-6 py-8">
          <NavLinks orientation="vertical" onNavigate={close} />
        </nav>
      </dialog>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
