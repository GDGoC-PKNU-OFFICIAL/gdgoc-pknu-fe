"use client";

import { Children, type ReactNode, useId } from "react";

import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/lib/cn";

interface CardSliderProps {
  /** 영역 이름 — 스크린리더가 읽는다 (예: "2025년 과거 프로젝트") */
  label: string;
  /** 카드 목록. 각 자식이 슬라이드 한 칸이 된다 */
  children: ReactNode;
  className?: string;
}

/**
 * 카드 좌우 슬라이드 (C-12, IA 5-4). 과거 프로젝트 · 코어멤버 · 시니어가 공유한다.
 * - 모바일(< 768px): 스와이프 + scroll-snap, 카드 1장 + 다음 카드 일부. 화살표 숨김
 * - 태블릿(768~1279px): 카드 2장 + 좌우 화살표 / 데스크톱(≥ 1280px): 카드 3장 + 좌우 화살표
 * - 가로 넘침은 트랙 안에서만 생긴다 (페이지 전체 가로 스크롤 금지)
 *
 * 스크롤 위치를 처음으로 되돌리려면(연도 변경 등) 호출하는 쪽에서 key 를 바꿔 다시 마운트한다.
 * 카드 안의 링크 · 버튼에 Tab 으로 포커스가 가면 브라우저가 트랙을 스크롤해 화면 안으로 가져온다.
 */
export default function CardSlider({ label, children, className }: CardSliderProps) {
  const trackId = useId();
  const { trackRef, canScrollPrev, canScrollNext, hasOverflow, scrollByPage } =
    useCarousel<HTMLUListElement>();

  return (
    <div role="region" aria-label={label} className={cn("relative", className)}>
      {/* relative: 카드 안의 absolute 요소(sr-only 등)가 트랙 기준으로 잡혀 트랙 안에서 잘리게 한다.
          없으면 화면 밖 카드의 absolute 요소가 트랙 밖으로 빠져나와 페이지 전체에 가로 스크롤을 만든다 */}
      <ul
        ref={trackRef}
        id={trackId}
        className="relative flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto overscroll-x-contain pb-1 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[85%] shrink-0 snap-start md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]">
            {child}
          </li>
        ))}
      </ul>

      {hasOverflow && (
        <>
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
        </>
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

function ArrowButton({ direction, controls, disabled, onClick }: ArrowButtonProps) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전 카드" : "다음 카드"}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        // 모바일은 스와이프만 쓴다 → md 이상에서만 보인다. 트랙 좌우 가장자리에 반쯤 걸쳐 둔다
        "absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-md md:flex",
        "transition-opacity hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        "disabled:pointer-events-none disabled:opacity-0",
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
