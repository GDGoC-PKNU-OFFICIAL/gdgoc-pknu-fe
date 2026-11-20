import Link from "next/link";

import Tag from "@/components/ui/Tag";
import { studyDetailHref } from "@/features/studies/lib/study-query";
import { cn } from "@/lib/cn";
import { formatMonthPeriod } from "@/lib/date";
import type { Study } from "@/types/api";

interface FeaturedStudyCardProps {
  study: Study;
  /** 0 부터. "STUDY 01" 처럼 보여 준다 */
  index: number;
}

/**
 * 홈 진행 중 스터디 큰 카드 (P-00 #5). 서버 컴포넌트다.
 * 카드 전체가 Studies 페이지(맨 위부터)로 가는 링크다 — 제목 링크를 카드 크기로 넓힌다 (after:inset-0).
 * 흰 카드다. hover: 3~4px 떠오르고 그림자가 짙어지며 화살표가 살짝 움직인다. 터치에서는 누르는 동안 살짝 눌린다.
 */
export default function FeaturedStudyCard({ study, index }: FeaturedStudyCardProps) {
  const { slug, topic, title, summary, period, participants, format } = study;
  const tags = [
    `#${topic}`,
    ...(format ? [format] : []),
    `${1 + participants.length}명`,
    formatMonthPeriod(period),
  ];

  return (
    <article
      className={cn(
        // 모바일(2장씩)은 비율을 유지한 채 여백 · 글자 · 모서리를 줄인다
        "group relative isolate flex h-full min-h-52 flex-col overflow-hidden rounded-[20px] border border-[#e4e9f4] p-4 sm:min-h-72 sm:rounded-[28px] sm:p-7 md:p-9 dark:border-line dark:shadow-none",
        "bg-surface shadow-[0_8px_30px_rgba(80,110,180,0.06)]",
        "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(80,110,180,0.14)] active:scale-[0.99]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-blue",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-brand-blue tabular-nums sm:text-xs">
          STUDY {String(index + 1).padStart(2, "0")}
        </span>
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center text-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none sm:size-10"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-6 sm:gap-3 sm:pt-10">
        <h3 className="text-base font-bold tracking-tight break-keep sm:text-2xl md:text-[28px]">
          <Link
            href={studyDetailHref(slug)}
            className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none sm:after:rounded-[28px]"
          >
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs break-keep text-ink-muted sm:text-[15px]">{summary}</p>
        <ul aria-label="스터디 정보" className="flex flex-wrap gap-1.5 pt-1">
          {/* 모바일 작은 카드는 앞의 태그 2개만 */}
          {tags.map((tag, tagIndex) => (
            <li key={tag} className={cn("min-w-0", tagIndex >= 2 && "hidden sm:block")}>
              <Tag className="tabular-nums">{tag}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
