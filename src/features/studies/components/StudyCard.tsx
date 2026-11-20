import Link from "next/link";

import { formatMonthPeriod } from "@/lib/date";
import type { Study } from "@/types/api";

import { studyDetailHref } from "../lib/study-query";

/**
 * 스터디 카드 (C-03, IA 5-3) — 명함 모양. 서버 · 클라이언트 어디서든 그릴 수 있다 (훅 없음).
 *
 * 명함 비율(90 × 50mm = 9 : 5, 좁은 모바일은 글이 들어가게 3 : 2)로 크기가 고정되고, 글은 모두 한 줄 말줄임이라 길어도 카드 밖으로 나가지 않는다.
 *   ┌──────────────────────────────────────┐
 *   │ GDGoC PKNU                2025.09 – │  ← 소속 · 기간
 *   │                                      │
 *   │ 스터디 제목                            │  ← 이름 자리
 *   │ 한 줄 소개                             │
 *   │                                      │
 *   │ 리더 이름          4명 · 주 1회 · 온라인 │  ← 대표자 · 연락처 자리
 *   │ STUDY LEADER                         │
 *   └──────────────────────────────────────┘
 *
 * 카드 어디를 눌러도 상세 카드가 열린다 — 제목 링크의 ::after 를 카드 전체로 늘린다.
 * 마우스를 올리면 명함을 집어 든 것처럼 살짝 떠오르고 그림자가 짙어진다 ("모션 줄이기"면 그림자만).
 * 주제 · 참여자 · 결과물은 상세 카드에서 보여 준다.
 */
export default function StudyCard({ study }: { study: Study }) {
  const { slug, title, summary, period, leader, participants, format } = study;
  const meta = [`${1 + participants.length}명`, format].filter(Boolean).join(" · ");

  return (
    <article className="group relative flex aspect-[3/2] min-w-0 flex-col justify-between overflow-hidden rounded-[6px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_8px_20px_-12px_rgba(16,24,40,0.18)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_20px_36px_-16px_rgba(16,24,40,0.3)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-blue motion-reduce:transition-shadow motion-reduce:hover:translate-y-0 sm:aspect-[9/5] md:p-6 dark:shadow-[0_8px_20px_-12px_rgba(0,0,0,0.7)]">
      {/* 소속 · 기간 */}
      <div className="flex items-center justify-between gap-3 text-[11px] text-ink-muted">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-semibold tracking-[0.14em]">GDGoC PKNU</span>
        </span>
        <span className="shrink-0 tabular-nums">{formatMonthPeriod(period)}</span>
      </div>

      {/* 제목 · 한 줄 소개 */}
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-lg font-bold tracking-tight md:text-xl" title={title}>
          <Link
            href={studyDetailHref(slug)}
            scroll={false}
            data-study-detail={slug}
            className="outline-none after:absolute after:inset-0"
          >
            {title}
            <span className="sr-only"> 자세히 보기</span>
          </Link>
        </h3>
        <p className="truncate text-sm text-ink-muted" title={summary}>
          {summary}
        </p>
      </div>

      {/* 리더 · 인원 · 방식 */}
      <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold" title={leader}>
            {leader}
          </span>
          <span className="text-[10px] font-medium tracking-[0.16em] text-ink-muted">
            STUDY LEADER
          </span>
        </div>
        <span className="min-w-0 truncate text-right text-xs text-ink-muted" title={meta}>
          {meta}
        </span>
      </div>
    </article>
  );
}
