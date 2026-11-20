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
      {/* 위아래 여백: 카드 그림자가 잘리지 않게 (늘린 만큼 바깥 간격은 당긴다).
          좌우: 보이는 영역을 섹션 안쪽 여백(px-4 · md:px-8)까지 넓혀, 끝 카드가 본문 폭 가장자리에서 잘리지 않게 한다.
          첫 카드는 트랙 왼쪽 여백(pl)으로, 끝 카드는 오른쪽 바깥 여백(last:mr — Embla 가 끝 간격으로 읽는다)으로
          본문 시작 · 끝선에 맞춘다 */}
      <div
        ref={viewportRef}
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
    </div>
  );
}
