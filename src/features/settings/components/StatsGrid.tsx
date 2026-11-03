"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { SiteStat } from "@/types/api";

/** 숫자가 0 에서 목표까지 올라가는 시간 */
const COUNT_UP_MS = 1800;
/** 통계 영역이 이만큼 보이면 숫자를 올리기 시작한다 */
const START_RATIO = 0.3;

/** 끝으로 갈수록 느려지는 곡선 */
function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

/**
 * 활동 통계 (P-00 #2). 항상 4칸, 모든 화면에서 2열 × 2행이고 칸 사이를 십자 구분선으로 나눈다.
 *
 * 화면에 들어오면 숫자가 0 부터 목표까지 한 번만 올라간다. 벗어났다 돌아와도 다시 세지 않는다.
 * "모션 줄이기" 설정에서는 바로 최종 값을 보여 준다.
 * 화면 읽기 프로그램에는 올라가는 숫자 대신 최종 값만 읽힌다 (sr-only).
 */
export default function StatsGrid({ stats }: { stats: SiteStat[] }) {
  const listRef = useRef<HTMLDListElement>(null);
  /** 0 → 1. 네 칸이 같은 진행도를 쓴다 */
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // 한 번 시작하면 더 볼 필요가 없다
        observer.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setProgress(1);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / COUNT_UP_MS, 1);
          setProgress(easeOutQuart(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: START_RATIO },
    );
    observer.observe(list);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <dl ref={listRef} className="grid w-full auto-rows-fr grid-cols-2">
      {stats.map(({ label, value, unit, suffix }, index) => {
        const mark = `${unit ?? ""}${suffix ?? ""}`;
        const finalText = value.toLocaleString("ko-KR");
        return (
          <div
            key={label}
            className={cn(
              "flex flex-col-reverse items-center justify-center gap-3 px-2 py-10 text-center md:py-16",
              index % 2 === 0 && "border-r border-line",
              index < 2 && "border-b border-line",
            )}
          >
            <dt className="text-sm whitespace-nowrap text-ink-muted md:text-base">{label}</dt>
            <dd className="flex items-start">
              <span className="sr-only">
                {finalText}
                {mark}
              </span>
              {/* 최종 값 자리를 미리 잡아 두어 숫자가 올라가는 동안 폭이 흔들리지 않는다 */}
              <span
                aria-hidden="true"
                className="relative text-4xl leading-none font-extrabold tracking-tight tabular-nums sm:text-6xl lg:text-[5rem]"
              >
                <span className="invisible">{finalText}</span>
                <span className="absolute inset-0 text-center">
                  {Math.round(value * progress).toLocaleString("ko-KR")}
                </span>
              </span>
              {mark && (
                <span
                  aria-hidden="true"
                  className="ml-1 text-lg leading-none font-bold text-brand-blue sm:text-2xl lg:text-3xl"
                >
                  {mark}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
