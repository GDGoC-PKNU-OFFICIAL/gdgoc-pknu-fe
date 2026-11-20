import Link from "next/link";

import type { RuleDoc, RuleIcon } from "@/data/rules";

import { ruleDetailHref } from "../lib/rule-query";

/** 24 × 24 채운 아이콘 (책 · 사람 · 사원증) */
export const RULE_ICON_PATHS: Record<RuleIcon, string> = {
  book: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM7 4h5v8l-2.5-1.5L7 12V4Z",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z",
  badge:
    "M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-7 2h4v1.5h-4V4Zm2 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM8 18v-.6c0-1.7 2.67-2.6 4-2.6s4 .9 4 2.6v.6H8Z",
};

/** 아이콘 네모 (블록 · 상세 카드 머리에 같이 쓴다) */
export function RuleIconTile({ icon }: { icon: RuleIcon }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" fillRule="evenodd">
        <path d={RULE_ICON_PATHS[icon]} />
      </svg>
    </span>
  );
}

/**
 * 활동 규칙 문서 블록 (About). 왼쪽 아이콘 + 문서 이름 + 오른쪽 화살표.
 * 블록 어디를 눌러도 ?rule= 상세 카드가 열린다 (RuleDetailController 가 페이지 이동 없이 연다).
 */
export default function RuleDocBlock({ doc: { slug, title, icon } }: { doc: RuleDoc }) {
  return (
    <li>
      <Link
        href={ruleDetailHref(slug)}
        scroll={false}
        data-rule-detail={slug}
        className="group flex min-h-20 items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <RuleIconTile icon={icon} />
        <span className="min-w-0 flex-1 text-lg font-semibold break-keep">{title}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        <span className="sr-only"> 자세히 보기</span>
      </Link>
    </li>
  );
}
