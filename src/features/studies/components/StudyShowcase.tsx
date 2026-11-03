import Link from "next/link";

import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/lib/cn";
import type { Study } from "@/types/api";

import FeaturedStudyCard from "./FeaturedStudyCard";

interface StudyShowcaseProps {
  /** 이미 정렬 · 개수를 자른 진행 중 스터디 */
  studies: Study[];
  emptyMessage: string;
  /** 카드 아래 학습 문화 줄. 누르면 Studies 페이지로 간다 */
  culture: { title: string; description: string; href: string; linkLabel: string };
}

/**
 * 홈 진행 중 스터디 (P-00 #5). 작은 카드를 늘어놓지 않고 큰 카드를 데스크톱 2열로 둔다.
 * 1개면 한 장이 폭을 다 쓴다. 카드 아래에는 구분선과 학습 문화 소개 한 줄을 둔다 (카드 모양이 아니다).
 */
export default function StudyShowcase({ studies, emptyMessage, culture }: StudyShowcaseProps) {
  return (
    <div className="flex flex-col gap-10">
      {studies.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className={cn("grid gap-7", studies.length > 1 && "lg:grid-cols-2")}>
          {studies.map((study, index) => (
            <li key={study.id}>
              <FeaturedStudyCard study={study} index={index} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href={culture.href}
        className="group flex items-center gap-4 border-t border-line pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue md:gap-6"
      >
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FF] text-brand-blue"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 4.6a3 3 0 0 1 0 5.8" />
          </svg>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-lg font-bold break-keep">{culture.title}</span>
          <span className="text-[15px] break-keep text-ink-muted">{culture.description}</span>
          <span className="sr-only">{culture.linkLabel}</span>
        </span>
        <span
          aria-hidden="true"
          className="text-xl text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-blue motion-reduce:transition-none"
        >
          →
        </span>
      </Link>
    </div>
  );
}
