"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

import Badge from "@/components/ui/Badge";
import { PROMISES } from "@/data/promises";
import { cn } from "@/lib/cn";

const itemId = (index: number) => `code-of-conduct-${index + 1}`;
const itemNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * About 동아리 강령 (P-01 #4, #code-of-conduct). 왼쪽은 제목 · 소개 · 목차, 오른쪽은 강령 카드 전체.
 *
 * - 데스크톱: 왼쪽 목차는 스크롤해도 화면에 붙어 있고, 지금 보고 있는 강령의 번호만 파랗게 표시한다
 * - 모바일 · 태블릿: 목차가 Header 바로 아래 가로 메뉴가 되어 붙는다
 * - 목차를 누르면 해당 카드로 스크롤한다 (주소에 # 을 남기지 않는다)
 * 강령 문구 · 순서는 data/promises.ts 원문 그대로다.
 */
export default function CodeOfConductSection() {
  const { badge, title, intro, items, anchorId } = PROMISES.about;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // 화면 가운데 띠를 지나는 카드를 "지금 보고 있는 강령"으로 본다
  useEffect(() => {
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-index]");
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // 모바일 가로 목차: 지금 강령 칩이 보이도록 목차만 옆으로 민다 (페이지는 움직이지 않는다)
  const chipsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = chipsRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!nav || !chip || nav.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: chip.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  function jumpTo(event: MouseEvent, index: number) {
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(itemId(index))
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    setActive(index);
  }

  // "Code of Conduct" → 마지막 낱말만 파랗게
  const words = title.split(" ");
  const accent = words.pop();

  return (
    <section id={anchorId} aria-labelledby="code-of-conduct-title" className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6 lg:sticky lg:top-28 lg:self-start">
          <Badge className="px-4 py-2 text-sm">{badge}</Badge>
          <h2
            id="code-of-conduct-title"
            className="text-5xl leading-[1.05] font-extrabold tracking-tight text-[#111111] sm:text-6xl xl:text-7xl"
          >
            {words.join(" ")}
            <br />
            <span className="text-brand-blue">{accent}</span>
          </h2>
          <p className="max-w-120 text-lg leading-[1.7] break-keep text-[#50566A]">{intro}</p>

          {/* 데스크톱 목차 */}
          <nav aria-label="강령 목차" className="mt-4 hidden lg:block">
            <ol className="flex flex-col border-l border-line">
              {items.map((item, index) => (
                <li key={item.title} className="relative">
                  {index === active && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -left-1.25 size-2.5 -translate-y-1/2 rounded-full bg-brand-blue"
                    />
                  )}
                  <a
                    href={`#${itemId(index)}`}
                    aria-current={index === active ? "true" : undefined}
                    onClick={(event) => jumpTo(event, index)}
                    className={cn(
                      "flex min-h-11 items-center gap-4 pl-6 text-[15px] transition-colors hover:text-ink",
                      index === active ? "font-semibold text-ink" : "text-ink-muted",
                    )}
                  >
                    <span className={cn("tabular-nums", index === active && "text-brand-blue")}>
                      {itemNumber(index)}
                    </span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* min-w-0: 가로 목차가 길어도 칸 폭을 밀어내지 않고 목차 안에서만 스크롤된다 */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* 모바일 · 태블릿 목차 — Header(h-16) 아래 가로 메뉴 */}
          <nav
            ref={chipsRef}
            aria-label="강령 목차"
            className="sticky top-16 z-10 -mx-4 [scrollbar-width:none] overflow-x-auto border-b border-line bg-surface/90 px-4 backdrop-blur md:-mx-8 md:px-8 lg:hidden"
          >
            <ol className="flex w-max gap-1 py-2">
              {items.map((item, index) => (
                <li key={item.title} data-chip={index}>
                  <a
                    href={`#${itemId(index)}`}
                    aria-current={index === active ? "true" : undefined}
                    onClick={(event) => jumpTo(event, index)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-full px-3 text-sm whitespace-nowrap",
                      index === active ? "bg-[#E8F0FF] font-semibold text-ink" : "text-ink-muted",
                    )}
                  >
                    <span className={cn("tabular-nums", index === active && "text-brand-blue")}>
                      {itemNumber(index)}
                    </span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <ol ref={listRef} className="flex flex-col gap-4">
            {items.map((item, index) => (
              <li
                key={item.title}
                id={itemId(index)}
                data-index={index}
                className="flex items-center gap-5 rounded-[28px] border border-[#e6ecf7] bg-surface px-5 py-7 shadow-[0_8px_30px_rgba(80,110,180,0.06)] sm:gap-8 sm:px-10"
              >
                <span
                  aria-hidden="true"
                  className="w-12 shrink-0 text-4xl font-light text-[#5791F5] tabular-nums sm:w-20 sm:text-[3.5rem] sm:leading-none"
                >
                  {itemNumber(index)}
                </span>
                <span aria-hidden="true" className="w-px self-stretch bg-[#D5E1FA]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <h3 className="text-xl leading-[1.4] font-bold break-keep text-[#171717] sm:text-[1.375rem]">
                    {item.title}
                  </h3>
                  <p className="text-base leading-normal break-keep text-[#68738B]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
