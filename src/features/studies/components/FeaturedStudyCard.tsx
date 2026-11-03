import Link from "next/link";

import Tag from "@/components/ui/Tag";
import { PUBLIC_ROUTES } from "@/constants/routes";
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
 * hover: 3~4px 떠오르고 파란 빛이 짙어지며 화살표가 살짝 움직인다. 터치에서는 누르는 동안 살짝 눌린다.
 */
export default function FeaturedStudyCard({ study, index }: FeaturedStudyCardProps) {
  const { topic, title, summary, period, participants, format } = study;
  const tags = [
    `#${topic}`,
    ...(format ? [format] : []),
    `${1 + participants.length}명`,
    formatMonthPeriod(period),
  ];

  return (
    <article
      className={cn(
        "group relative isolate flex h-full min-h-72 flex-col overflow-hidden rounded-[28px] border border-[#e4e9f4] p-7 md:p-9",
        "bg-[linear-gradient(140deg,#ffffff_0%,#f4f7ff_55%,#e8efff_100%)] shadow-[0_32px_64px_-40px_rgba(66,133,244,0.55)]",
        "transition duration-300 ease-out hover:-translate-y-1 active:scale-[0.99]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-blue",
      )}
    >
      {/* hover 때 짙어지는 파란 빛 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_45%,#d6e3ff_0%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.16em] text-brand-blue tabular-nums">
          STUDY {String(index + 1).padStart(2, "0")}
        </span>
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full border border-[#e4e9f4] bg-surface/80 text-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
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

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <h3 className="text-2xl font-bold tracking-tight break-keep md:text-[28px]">
          <Link
            href={PUBLIC_ROUTES.studies}
            className="after:absolute after:inset-0 after:rounded-[28px] focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[15px] break-keep text-ink-muted">{summary}</p>
        <ul aria-label="스터디 정보" className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <li key={tag} className="min-w-0">
              <Tag className="bg-surface/80 tabular-nums">{tag}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
