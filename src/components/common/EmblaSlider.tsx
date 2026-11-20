"use client";

import { Children, type ReactNode } from "react";

import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * Embla Carousel 로 만든 카드 슬라이드 (About What We Do).
 * - 마우스 · 손가락 끌기, 놓으면 속도만큼 관성으로 넘어가 카드 경계에 멈춤 (skipSnaps: 세게 밀면 여러 장 건너뜀)
 * - 양 끝에서는 저항을 받으며 끌렸다가 돌아온다 (Embla 기본)
 * - 트랙패드 두 손가락 가로 스와이프 (WheelGesturesPlugin)
 * 카드 폭: 모바일 70%(다음 카드가 넉넉히 보임) · 태블릿 약 2.6장 · 데스크톱 4장.
 */
export default function EmblaSlider({ label, children }: { label: string; children: ReactNode }) {
  const [viewportRef] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      skipSnaps: true,
      // 놓은 뒤 카드에 멈출 때까지의 감속 길이 (기본 25, 최대 60 — 클수록 길고 부드럽게 멈춘다)
      duration: 60,
    },
    [WheelGesturesPlugin()],
  );

  return (
    <div role="region" aria-label={label} aria-roledescription="carousel">
      {/* 위아래 여백: 카드 그림자가 잘리지 않게 (늘린 만큼 바깥 간격은 당긴다) */}
      <div
        ref={viewportRef}
        className="-mb-8 cursor-grab overflow-hidden pt-2 pb-10 active:cursor-grabbing"
      >
        {/* will-change: Embla 가 매 프레임 옮기는 transform 을 GPU 레이어로 그려 끊김을 줄인다 */}
        <ul className="-ml-4 flex touch-pan-y will-change-transform">
          {Children.map(children, (child) => (
            <li className="w-[70%] min-w-0 shrink-0 pl-4 md:w-[38%] xl:w-1/4">{child}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
