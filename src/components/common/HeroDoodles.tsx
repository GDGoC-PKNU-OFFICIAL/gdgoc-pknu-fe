import { type CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * 홈 히어로 장식 — 제목 둘레에 떠 있는 알록달록한 도형들 (브랜드 아이덴티티 포스터 느낌).
 * 모두 장식이라 화면 읽기 프로그램에는 숨긴다. 천천히 위아래로 떠다니고("모션 줄이기"면 멈춤),
 * 모바일에서는 글과 겹치지 않게 숨긴다.
 */

const FLOAT = "motion-safe:animate-doodle";
/** 도형이 하나씩 나타나는 간격 (초) */
const POP_STAGGER = 0.09;

export default function HeroDoodles({
  start = 0,
  className,
}: {
  /** 첫 도형이 나타나는 시각 (초) — 제목 등장이 끝난 뒤로 맞춘다 */
  start?: number;
  className?: string;
}) {
  /** order 번째로 톡 나타나고, 그 뒤 float 박자를 offset 초만큼 엇갈려 떠다닌다 */
  const appear = (order: number, offset: number): CSSProperties => {
    const pop = start + order * POP_STAGGER;
    return { animationDelay: `${pop.toFixed(2)}s, ${(pop + 0.5 + offset).toFixed(2)}s` };
  };

  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)}>
      {/* 왼쪽 위: 파란 공 + 주황 반원 */}
      <span
        className={cn("absolute top-[14%] left-[9%] size-12 rounded-full bg-[#4285f4]", FLOAT)}
        style={appear(0, 0)}
      />
      <span
        className={cn(
          "absolute top-[22%] left-[3%] size-36 rotate-[200deg] rounded-full border-[22px] border-[#ff7a1a] border-t-transparent border-r-transparent",
          FLOAT,
        )}
        style={appear(6, 1.2)}
      />
      {/* 왼쪽 아래: 노란 해 · 흰 반짝이 · 보라 둥근 네모 */}
      <svg
        viewBox="0 0 100 100"
        className={cn("absolute bottom-[26%] left-[6%] size-28 text-[#fbbc04]", FLOAT)}
        style={appear(1, 0.6)}
      >
        <polygon
          fill="currentColor"
          points={Array.from({ length: 32 }, (_, i) => {
            const r = i % 2 === 0 ? 50 : 36;
            const a = (Math.PI * i) / 16;
            return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
          }).join(" ")}
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className={cn("absolute bottom-[38%] left-[22%] size-10 text-white", FLOAT)}
        style={appear(10, 2)}
      >
        <path
          fill="currentColor"
          d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"
        />
      </svg>
      <span
        className={cn(
          "absolute bottom-[8%] left-[7%] h-20 w-32 -rotate-6 rounded-3xl bg-[#b98be8]",
          FLOAT,
        )}
        style={appear(8, 1.6)}
      />

      {/* 위 가운데: 분홍 하트 */}
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "absolute top-[12%] left-[30%] size-12 rotate-12 overflow-visible text-[#f0609e]",
          FLOAT,
        )}
        style={appear(4, 0.9)}
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinejoin="round"
          d="M12 21.4 10.6 20C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21.4z"
        />
      </svg>

      {/* 오른쪽 위: 초록 세모 · 노란 반원 */}
      <svg
        viewBox="0 0 100 100"
        className={cn("absolute top-[10%] right-[20%] size-28 -rotate-12 text-[#34a853]", FLOAT)}
        style={appear(9, 0.3)}
      >
        <path
          fill="currentColor"
          d="M12 78 L52 14 Q58 6 64 14 L94 72 Q98 82 86 84 L22 90 Q6 90 12 78z"
        />
      </svg>
      <span
        className={cn(
          "absolute top-[8%] right-[2%] size-40 rotate-[30deg] rounded-full border-[24px] border-[#fbbc04] border-b-transparent border-l-transparent",
          FLOAT,
        )}
        style={appear(7, 1.9)}
      />

      {/* 오른쪽 아래: 보라 톱니 · 주황 공 · 흰 평행사변형 */}
      <svg
        viewBox="0 0 100 100"
        className={cn("absolute top-[44%] right-[13%] size-24 text-[#b98be8]", FLOAT)}
        style={appear(2, 1.1)}
      >
        <polygon
          fill="currentColor"
          points={Array.from({ length: 24 }, (_, i) => {
            const r = i % 2 === 0 ? 50 : 42;
            const a = (Math.PI * i) / 12;
            return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
          }).join(" ")}
        />
      </svg>
      <span
        className={cn("absolute right-[7%] bottom-[24%] size-20 rounded-full bg-[#ff7a1a]", FLOAT)}
        style={appear(5, 0.4)}
      />
      <span
        className={cn(
          "absolute right-[16%] bottom-[8%] h-14 w-36 rotate-[18deg] -skew-x-[30deg] rounded-2xl bg-white",
          FLOAT,
        )}
        style={appear(3, 2.3)}
      />
    </div>
  );
}
