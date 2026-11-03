import { type CSSProperties } from "react";

import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { PROMISES } from "@/data/promises";
import { cn } from "@/lib/cn";

import { FULL_SCREEN_SECTION } from "./PageSection";
import RevealOnScroll from "./RevealOnScroll";

/** 제목의 "세 가지" — 항목 수에 맞춰 바뀐다 */
const COUNT_WORDS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];

const revealOrder = (order: number) => ({ "--reveal-order": order }) as CSSProperties;

/**
 * 홈 마지막 약속 섹션 (P-00 #8, C-07 의 홈 전용 모양). 다른 페이지는 PromiseSection 을 그대로 쓴다.
 * 왼쪽 40% 에 큰 제목 · 소개, 오른쪽 60% 에 약속 카드를 번호 순서로 세로로 둔다. 태블릿 이하는 위아래로 쌓는다.
 * 약속 문구는 data/promises.ts 의 홈 항목 그대로다. 카드를 누르면 About 의 동아리 강령 전문으로 간다.
 */
export default function ManifestoSection() {
  const { badge, items, link, intro } = PROMISES.home;
  const countWord = COUNT_WORDS[items.length] ?? String(items.length);

  return (
    <section
      aria-labelledby="promise-home-title"
      className={cn("md:flex md:flex-col", FULL_SCREEN_SECTION)}
    >
      <RevealOnScroll className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 md:px-8 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div data-reveal-item style={revealOrder(0)} className="flex flex-col items-start gap-6">
          <Badge className="px-4 py-2 text-sm">{badge}</Badge>
          <h2
            id="promise-home-title"
            className="text-4xl leading-[1.15] font-extrabold tracking-tight break-keep text-[#111111] sm:text-5xl xl:text-[3.75rem]"
          >
            우리가 지키는
            <br />
            <span className="text-brand-blue">{countWord} 가지 약속.</span>
          </h2>
          <p className="mt-2 max-w-120 text-lg leading-[1.7] break-keep text-[#50566A]">{intro}</p>
          <Link
            href={link.href}
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand-blue hover:underline"
          >
            {link.label} →
          </Link>
        </div>

        <ol className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.title} data-reveal-item style={revealOrder(index + 1)}>
              <Link
                href={link.href}
                className={cn(
                  "group flex min-h-[7.8rem] items-center gap-5 rounded-[28px] border border-[#e6ecf7] bg-surface px-5 py-6 sm:gap-8 sm:px-10",
                  "shadow-[0_8px_30px_rgba(80,110,180,0.06)] transition duration-300 ease-out",
                  "hover:-translate-y-1 hover:bg-[#f4f8ff]/90 hover:shadow-[0_18px_40px_rgba(80,110,180,0.14)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                )}
              >
                <span
                  aria-hidden="true"
                  className="w-12 shrink-0 text-4xl font-light text-[#5791F5] tabular-nums sm:w-20 sm:text-[3.5rem] sm:leading-none"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="w-px self-stretch bg-[#D5E1FA]" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-xl leading-[1.4] font-bold break-keep text-[#171717] sm:text-[1.375rem]">
                    {item.title}
                  </span>
                  <span className="text-base leading-normal break-keep text-[#68738B]">
                    {item.description}
                  </span>
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-6 shrink-0 text-[#171717] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>
      </RevealOnScroll>
    </section>
  );
}
