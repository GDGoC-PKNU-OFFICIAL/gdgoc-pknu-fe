"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * 고정 헤더 바깥 틀. 페이지 맨 위에서는 아래 경계선을 숨기고, 조금(8px 넘게) 스크롤하면 보인다 — 맨 위에서도 scrollY 가 1 쯤 남는 경우가 있다.
 * 안쪽 내용(로고 · 메뉴)은 서버 컴포넌트 그대로 children 으로 받는다.
 */
export default function HeaderBar({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-surface/90 backdrop-blur transition-colors duration-200",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      {children}
    </header>
  );
}
