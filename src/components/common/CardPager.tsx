"use client";

import { Children, type ReactNode, useEffect, useId, useState } from "react";

import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/lib/cn";

import { SLIDER_ARROW_VISIBILITY } from "./slider-arrow";

interface CardPagerProps {
  /** 영역 이름 — 스크린리더가 읽는다 (예: "진행 중 스터디") */
  label: string;
  /** 한 쪽에 들어가는 카드 수. 이보다 많으면 다음 쪽으로 넘어간다 */
  pageSize: number;
  /** 카드 목록. 각 자식이 카드 한 칸이 된다 */
  children: ReactNode;
}

/**
 * 쪽 단위로 넘기는 카드 그리드.
 * - 태블릿 · 데스크톱: 한 쪽은 2열 · 3열 그리드이고, 카드가 pageSize 개를 넘으면 다음 쪽이 오른쪽에 이어진다.
 *   스와이프 · 트랙패드 가로 스크롤(scroll-snap 으로 쪽 경계에 멈춤) + 좌우 화살표 + 아래 쪽 표시 점.
 *   카드가 한 쪽에 다 들어가면 화살표 · 점 없이 그리드만 그린다.
 * - 모바일: 쪽 구분 없이 모든 카드가 한 줄로 이어지고 옆으로 스와이프해 넘긴다 (카드 1장 + 다음 카드 일부).
 *   쪽 묶음(ul)을 display: contents 로 풀어 카드(li)가 트랙의 직접 칸이 되게 한다.
 * 가로 넘침은 트랙 안에서만 생긴다 (페이지 전체 가로 스크롤 금지).
 */
export default function CardPager({ label, pageSize, children }: CardPagerProps) {
  const items = Children.toArray(children);
  const pages: ReactNode[][] = [];
  for (let start = 0; start < items.length; start += pageSize) {
    pages.push(items.slice(start, start + pageSize));
  }

  const trackId = useId();
  const { trackRef, canScrollPrev, canScrollNext, scrollByPage } = useCarousel<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);

  // 지금 보이는 쪽 번호 — 점 표시용
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // 쪽 사이 간격(PAGE_GAP)이 있으므로 각 쪽의 시작 위치와 비교한다
    const update = () => {
      const starts = [...track.children].map((page) => (page as HTMLElement).offsetLeft);
      const nearest = starts.reduce(
        (best, start, index) =>
          Math.abs(start - track.scrollLeft) < Math.abs(starts[best] - track.scrollLeft)
            ? index
            : best,
        0,
      );
      setCurrentPage(nearest);
    };
    track.addEventListener("scroll", update, { passive: true });
    return () => track.removeEventListener("scroll", update);
  }, [trackRef]);

  const goToPage = (page: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = track.children[page] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const multiPage = pages.length > 1;

  return (
    <div role="region" aria-label={label} className="group/slider flex flex-col gap-6">
      <div className="relative">
        {/* py-3 · -my-3: 마우스를 올리면 카드가 위로 떠오르고 그림자가 커지는데, 가로 스크롤 트랙이 위아래를 잘라 내지 않도록
            여유를 두고 바깥 간격은 그대로 둔다 */}
        {/* relative: 카드 안 absolute 요소가 트랙 기준으로 잡혀 트랙 밖으로 빠져나가지 않게.
            md:gap-16: 쪽 사이를 띄워, 넘긴 뒤 이전 쪽 카드의 테두리 · 그림자가 왼쪽 가장자리에 비치지 않게 */}
        <div
          ref={trackRef}
          id={trackId}
          className="relative -my-3 scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-3 md:gap-16 [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((page, pageIndex) => (
            <ul
              key={pageIndex}
              aria-label={multiPage ? `${pageIndex + 1} / ${pages.length} 쪽` : undefined}
              className="contents md:grid md:w-full md:shrink-0 md:snap-start md:grid-cols-2 md:content-start md:gap-4 xl:grid-cols-3"
            >
              {page.map((item, index) => (
                <li key={index} className="w-[85%] min-w-0 shrink-0 snap-start md:w-auto">
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>

        <ArrowButton
          direction="prev"
          controls={trackId}
          disabled={!canScrollPrev}
          onClick={() => scrollByPage(-1)}
        />
        <ArrowButton
          direction="next"
          controls={trackId}
          disabled={!canScrollNext}
          onClick={() => scrollByPage(1)}
        />
      </div>

      {/* 쪽 표시 점 — 눌러서 그 쪽으로 간다 (태블릿 · 데스크톱, 쪽이 둘 이상일 때) */}
      {multiPage && (
        <div className="hidden justify-center gap-2 md:flex">
          {pages.map((_, pageIndex) => {
            const active = pageIndex === currentPage;
            return (
              <button
                key={pageIndex}
                type="button"
                aria-label={`${pageIndex + 1}쪽`}
                aria-current={active ? "true" : undefined}
                aria-controls={trackId}
                onClick={() => goToPage(pageIndex)}
                className="flex size-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-blue"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-300",
                    active ? "w-6 bg-ink" : "w-2 bg-line",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ArrowButtonProps {
  direction: "prev" | "next";
  controls: string;
  disabled: boolean;
  onClick: () => void;
}

/** CardSlider 와 같은 모양의 좌우 화살표 (md 이상). 맨 앞 · 맨 끝이면 숨긴다 */
function ArrowButton({ direction, controls, disabled, onClick }: ArrowButtonProps) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전 쪽" : "다음 쪽"}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-md md:flex",
        "transition-opacity hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        SLIDER_ARROW_VISIBILITY,
        isPrev ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
