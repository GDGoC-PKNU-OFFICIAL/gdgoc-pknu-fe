"use client";

import { Children, type ReactNode, useCallback, useEffect, useId, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { cn } from "@/lib/cn";

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

/**
 * Embla Carousel 로 만든 카드 슬라이드 (About What We Do).
 * - 마우스 · 손가락 끌기, 놓으면 속도만큼 관성으로 넘어가 카드 경계에 멈춤 (skipSnaps: 세게 밀면 여러 장 건너뜀)
 * - 양 끝에서는 저항을 받으며 끌렸다가 돌아온다 (Embla 기본)
 * - 트랙패드 두 손가락 가로 스와이프 (WheelGesturesPlugin)
 * - 태블릿 이상은 양옆 화살표 버튼으로 한 화면(보이는 카드 수)씩 넘긴다. 맨 앞 · 맨 끝이면 그쪽 버튼을 숨긴다
 *   (CardSlider · CardPager 와 같은 모양 · 위치)
 * 카드 폭: 모바일 70%(다음 카드가 넉넉히 보임) · 태블릿 약 2.6장 · 데스크톱 4장.
 */
export default function EmblaSlider({ label, children }: { label: string; children: ReactNode }) {
  const trackId = useId();
  const [viewportRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      skipSnaps: true,
      // 놓은 뒤 카드에 멈출 때까지의 감속 길이 (기본 25, 최대 60 — 클수록 길고 부드럽게 멈춘다)
      duration: 60,
      // slidesInView() 가 다 보이는 카드만 세게 한다 — 반쯤 걸친 카드를 화살표가 건너뛰지 않도록
      inViewThreshold: 1,
    },
    [WheelGesturesPlugin()],
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // 끌기 · 버튼 · 창 크기 변경 뒤마다 양 끝에 닿았는지 다시 본다
  useEffect(() => {
    if (!emblaApi) return;
    const update = (api: EmblaApi) => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update(emblaApi);
    emblaApi.on("select", update).on("reInit", update);
    return () => {
      emblaApi.off("select", update).off("reInit", update);
    };
  }, [emblaApi]);

  /** 지금 화면에 다 보이는 카드 수만큼 건너뛴다 — 한 번 누르면 다음 묶음이 처음부터 보인다 */
  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      if (!emblaApi) return;
      const step = Math.max(1, emblaApi.slidesInView().length);
      const lastSnap = emblaApi.scrollSnapList().length - 1;
      const target = Math.min(
        lastSnap,
        Math.max(0, emblaApi.selectedScrollSnap() + direction * step),
      );
      // "모션 줄이기"면 애니메이션 없이 바로 옮긴다
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      emblaApi.scrollTo(target, reduceMotion);
    },
    [emblaApi],
  );

  return (
    <div role="region" aria-label={label} aria-roledescription="carousel" className="relative">
      {/* 위아래 여백: 카드 그림자가 잘리지 않게 (늘린 만큼 바깥 간격은 당긴다).
          좌우: 보이는 영역을 섹션 안쪽 여백(px-4 · md:px-8)까지 넓혀, 끝 카드가 본문 폭 가장자리에서 잘리지 않게 한다.
          첫 카드는 트랙 왼쪽 여백(pl)으로, 끝 카드는 오른쪽 바깥 여백(last:mr — Embla 가 끝 간격으로 읽는다)으로
          본문 시작 · 끝선에 맞춘다 */}
      <div
        ref={viewportRef}
        id={trackId}
        className="-mx-4 -mb-8 cursor-grab overflow-hidden pt-2 pb-10 active:cursor-grabbing md:-mx-8"
      >
        {/* will-change: Embla 가 매 프레임 옮기는 transform 을 GPU 레이어로 그려 끊김을 줄인다 */}
        <ul className="flex touch-pan-y gap-4 pl-4 will-change-transform md:pl-8">
          {Children.map(children, (child) => (
            <li className="w-[70%] min-w-0 shrink-0 last:mr-4 md:w-[38%] md:last:mr-8 xl:w-[calc((100%-4rem-3rem)/4)]">
              {child}
            </li>
          ))}
        </ul>
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
  );
}

interface ArrowButtonProps {
  direction: "prev" | "next";
  controls: string;
  disabled: boolean;
  onClick: () => void;
}

/**
 * CardSlider 와 같은 모양의 좌우 화살표 (md 이상 — 모바일은 끌기만). 본문 폭 가장자리에 반쯤 걸쳐 둔다.
 * 세로 위치는 카드 가운데 — 트랙 아래 여백(pb-10 · -mb-8 = 0.5rem 차이)만큼 위로 올린다.
 */
function ArrowButton({ direction, controls, disabled, onClick }: ArrowButtonProps) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전 활동" : "다음 활동"}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-[calc(50%-0.25rem)] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-md md:flex",
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
