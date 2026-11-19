"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { applyTheme, storeTheme, type Theme } from "@/lib/theme";

/** <html data-theme> 이 바뀌면 다시 그린다 (다른 탭 · 첫 화면 스크립트가 바꾼 값도 따라간다) */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/**
 * 헤더의 라이트 / 다크 전환 버튼. 해 · 달 아이콘은 CSS(dark:)로 바꿔 끼워 첫 화면부터 맞게 보인다.
 * 고른 값은 브라우저에 남아 다음 방문에도 유지된다 (lib/theme.ts).
 */
export default function ThemeToggle({ className }: { className?: string }) {
  // 서버에서는 테마를 모르므로 라이트로 그리고, 하이드레이션 후 실제 값으로 맞춘다
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={next === "dark" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      title={next === "dark" ? "다크 모드" : "라이트 모드"}
      onClick={() => {
        applyTheme(next);
        storeTheme(next);
      }}
      className={cn(
        "flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        className,
      )}
    >
      {/* 라이트일 때: 달 (다크로 가기) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
      </svg>
      {/* 다크일 때: 해 (라이트로 가기) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="hidden size-5 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    </button>
  );
}
