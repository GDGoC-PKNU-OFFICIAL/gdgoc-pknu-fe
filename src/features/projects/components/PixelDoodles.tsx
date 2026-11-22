import { type CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Projects 장식 — 픽셀 블록 · 작은 사각형 · 도트 (프로젝트 썸네일의 픽셀 그림과 같은 말투).
 * 홈 · About 의 납작한 색 도형(SectionDoodles)과 색은 같고(Google 4색 + 보라 + 흰색) 모양만 픽셀이다.
 *
 * - 장식 층이라 화면 읽기 프로그램에서 숨기고 클릭을 막지 않는다. 층 순서는 문서 순서대로다 — 뒤에 오는 흰 영역 · 카드(위치 지정 요소)가
 * 위에 오고, 배경색만 있는 머리말보다는 앞에 와서 머리말 오른쪽 빈 곳의 픽셀이 가려지지 않는다. 글자 위에는 두지 않는다.
 * - 진입 애니메이션 마지막에(카드가 다 올라온 뒤) 하나씩 톡 나타나 둥둥 떠다닌다 (pixel-pop). "모션 줄이기"면 처음부터 제자리.
 * - 모바일은 픽셀 한 칸을 작게(--px), 몇 개는 숨긴다(md:block).
 */

const COLORS = {
  blue: "bg-[#4285f4]",
  red: "bg-[#ea4335]",
  yellow: "bg-[#fbbc04]",
  green: "bg-[#34a853]",
  purple: "bg-[#b98be8]",
  white: "bg-white",
} as const;

/** 픽셀 배치 — "#" 칸만 칠한다. 줄마다 같은 길이 */
const PATTERNS = {
  L: ["#.", "#.", "##"],
  S: [".##", "##."],
  T: ["###", ".#."],
  plus: [".#.", "###", ".#."],
  block: ["##", "##"],
  dots: ["#.#.#"],
  steps: ["#..", "##.", "###"],
  dot: ["#"],
} as const;

interface PixelProps {
  pattern: keyof typeof PATTERNS;
  color: keyof typeof COLORS;
  /** 위치 · 회전 · 픽셀 크기(--px) · 보이는 화면 폭 */
  className: string;
  /** 나타나는 시각 (초, 페이지 진입 기준) */
  at: number;
}

function Pixel({ pattern, color, className, at }: PixelProps) {
  const rows = PATTERNS[pattern];
  const columns = rows[0].length;
  return (
    <span
      className={cn(
        "absolute grid gap-[3px] [--px:10px] motion-safe:animate-pixel-pop md:[--px:14px]",
        className,
      )}
      style={
        {
          gridTemplateColumns: `repeat(${columns}, var(--px))`,
          gridAutoRows: "var(--px)",
          animationDelay: `${at}s, ${(at + 0.45).toFixed(2)}s`,
          // 같은 박자로 오르내리지 않게 떠다니는 속도를 조금씩 다르게
          animationDuration: `0.45s, ${(6 + ((at * 7) % 2.4)).toFixed(2)}s`,
        } as CSSProperties
      }
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => (
          <span
            key={`${y}-${x}`}
            className={cell === "#" ? cn("rounded-[2px]", COLORS[color]) : ""}
          />
        )),
      )}
    </span>
  );
}

const PRESETS = {
  // 파란 프레임 위쪽 — 흰 영역이 덮지 않는 띠에만 (rem 위치)
  frame: [
    { pattern: "L", color: "yellow", at: 1.35, className: "top-5 left-[5%] md:top-8" },
    { pattern: "plus", color: "white", at: 1.45, className: "top-10 left-[34%] hidden md:grid" },
    { pattern: "dots", color: "red", at: 1.55, className: "top-6 right-[30%] md:top-10" },
    { pattern: "block", color: "green", at: 1.4, className: "top-12 right-[7%] md:top-14" },
    { pattern: "dot", color: "white", at: 1.6, className: "top-16 left-[20%] hidden md:grid" },
    { pattern: "S", color: "purple", at: 1.5, className: "top-9 left-[56%] hidden md:grid" },
  ],
  // 흰 영역 안 — 머리말 오른쪽 빈 곳, 카드 줄 바깥 가장자리 (높이는 흰 영역 기준 %)
  sheet: [
    { pattern: "T", color: "blue", at: 1.5, className: "top-[3%] right-[7%] rotate-12" },
    {
      pattern: "steps",
      color: "yellow",
      at: 1.65,
      className: "top-[5%] right-[22%] hidden md:grid",
    },
    {
      pattern: "dots",
      color: "green",
      at: 1.75,
      className: "top-[67%] left-[40%] hidden md:grid",
    },
    { pattern: "L", color: "red", at: 1.85, className: "right-[3%] bottom-[3%] -rotate-90" },
    {
      pattern: "block",
      color: "purple",
      at: 1.9,
      className: "bottom-[6%] left-[46%] hidden md:grid",
    },
  ],
} satisfies Record<string, PixelProps[]>;

export default function PixelDoodles({ preset }: { preset: keyof typeof PRESETS }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {PRESETS[preset].map((pixel, index) => (
        <Pixel key={index} {...pixel} />
      ))}
    </div>
  );
}
