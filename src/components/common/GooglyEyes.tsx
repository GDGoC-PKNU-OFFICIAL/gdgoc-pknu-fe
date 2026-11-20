"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/** 눈동자가 흰자 가운데에서 움직일 수 있는 최대 거리 (흰자 폭 대비 %) */
const MAX_SHIFT = 22;

/**
 * 보라 동그라미 속 눈 한 쌍 — 홈 히어로 제목 첫 글자 왼쪽 위에 얹는다.
 * delay 초에 톡 나타나고(pop-in), 4초에 한 번 깜빡이며(blink), 눈동자는 마우스 커서 쪽을 쳐다본다.
 * 장식이라 화면 읽기 프로그램에는 숨긴다. 터치 화면 · "모션 줄이기"에서는 눈동자가 가만히 있다.
 */
export default function GooglyEyes({
  delay = 0,
  className,
}: {
  delay?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pupils = root.querySelectorAll<HTMLElement>("[data-pupil]");
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        pupils.forEach((pupil) => {
          // 각 흰자 가운데에서 커서 쪽 방향으로, 거리가 멀수록 끝까지 (가까우면 덜) 옮긴다
          const eye = pupil.parentElement!.getBoundingClientRect();
          const dx = event.clientX - (eye.left + eye.width / 2);
          const dy = event.clientY - (eye.top + eye.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const reach = Math.min(1, distance / 120);
          const x = (dx / distance) * MAX_SHIFT * reach;
          const y = (dy / distance) * MAX_SHIFT * reach;
          pupil.style.translate = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
        });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center gap-[8%] rounded-full bg-[#b98be8] shadow-lg motion-safe:animate-pop-in",
        className,
      )}
      style={{ animationDelay: `${delay.toFixed(2)}s` }}
    >
      {[0, 1].map((i) => (
        // 흰자: 깜빡임(scale). 눈동자: 커서 쪽으로 이동(translate) — 서로 다른 속성이라 함께 움직인다
        <span
          key={i}
          className="relative flex h-[46%] w-[30%] items-center justify-center rounded-full bg-white motion-safe:animate-blink"
        >
          <span
            data-pupil
            className="block size-[56%] rounded-full bg-[#1f1f1f] transition-[translate] duration-150 ease-out"
          />
        </span>
      ))}
    </span>
  );
}
