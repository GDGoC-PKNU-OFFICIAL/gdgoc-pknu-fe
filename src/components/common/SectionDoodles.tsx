import { type CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * 홈 섹션 장식 도형 — 히어로(HeroDoodles)와 같은 말투의 납작한 색 도형을 섹션 가장자리 빈 곳에 띄운다.
 *
 * - 콘텐츠와 따로 그리는 장식 층이다: 화면 읽기 프로그램에서 숨기고(aria-hidden) 클릭을 막지 않는다(pointer-events: none).
 * - 층은 섹션 높이 × 화면 전체 폭으로 깔리고(본문 폭 max-w-site 보다 넓다) 넘치는 부분을 잘라 낸다 —
 *   도형 일부가 화면 · 섹션 경계에서 잘려 "밖에서 들어온" 느낌을 준다. 섹션은 relative isolate 여야 한다.
 * - 콘텐츠 뒤(-z-10)에 깔리므로 카드와 겹쳐도 카드가 위에 온다. 그래도 대부분 여백 · 가장자리에 둔다.
 * - 모바일은 도형을 작게, 개수를 줄여(md:block) 화면 끝에만 걸친다.
 * - 둥둥 떠다닌다(drift: 위아래 + 살짝 옆으로). 도형마다 박자 · 속도를 엇갈려 함께 오르내리지 않는다. "모션 줄이기"면 멈춘다.
 *
 * 색은 Google 4색 + 보라(히어로 보라 #b98be8). 섹션마다 배치를 정해 둔 preset 으로 쓴다.
 */

const COLORS = {
  blue: { fill: "bg-[#4285f4]", text: "text-[#4285f4]", border: "border-[#4285f4]" },
  red: { fill: "bg-[#ea4335]", text: "text-[#ea4335]", border: "border-[#ea4335]" },
  yellow: { fill: "bg-[#fbbc04]", text: "text-[#fbbc04]", border: "border-[#fbbc04]" },
  green: { fill: "bg-[#34a853]", text: "text-[#34a853]", border: "border-[#34a853]" },
  purple: { fill: "bg-[#b98be8]", text: "text-[#b98be8]", border: "border-[#b98be8]" },
  // 파란 바탕(About 컬러 배경) 위의 반짝이용
  white: { fill: "bg-white", text: "text-white", border: "border-white" },
} as const;

type DoodleColor = keyof typeof COLORS;

type DoodleKind =
  | "ball"
  | "half"
  | "arc"
  | "sun"
  | "gear"
  | "sparkle"
  | "triangle"
  | "tile"
  | "pill"
  | "wave"
  | "heart";

/** 바깥 반지름 · 안쪽 반지름을 번갈아 찍은 별 모양 꼭짓점 (해 · 톱니) — HeroDoodles 와 같은 식 */
function spikyPoints(count: number, inner: number): string {
  return Array.from({ length: count }, (_, i) => {
    const r = i % 2 === 0 ? 50 : inner;
    const a = (Math.PI * 2 * i) / count;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const SUN_POINTS = spikyPoints(32, 36);
const GEAR_POINTS = spikyPoints(24, 42);

interface DoodleProps {
  kind: DoodleKind;
  color: DoodleColor;
  /** 위치 · 크기 · 회전 · 보이는 화면 폭 (Tailwind) */
  className: string;
  /** 떠다니는 박자를 엇갈릴 시간 (초). 음수로 넣어 처음부터 서로 다른 높이에서 시작한다. 속도도 이 값으로 조금씩 다르게 한다 */
  delay?: number;
  /**
   * 주면 페이지에 들어온 뒤 이 시각(초)에 톡 나타난 다음 떠다닌다 (doodle-pop = pop-in + drift, Projects 진입 마지막 단계).
   * 없으면 처음부터 떠다닌다.
   */
  at?: number;
}

function Doodle({ kind, color, className, delay = 0, at }: DoodleProps) {
  const c = COLORS[color];
  // 한 바퀴 6 ~ 8.4초 — 도형마다 달라 시간이 지나도 박자가 맞춰지지 않는다
  const driftSeconds = (6 + ((delay * 7) % 2.4)).toFixed(2);
  const style: CSSProperties =
    at === undefined
      ? { animationDelay: `${-delay}s`, animationDuration: `${driftSeconds}s` }
      : {
          animationDelay: `${at}s, ${(at + 0.45).toFixed(2)}s`,
          animationDuration: `0.45s, ${driftSeconds}s`,
        };
  const base = cn(
    "absolute",
    at === undefined ? "motion-safe:animate-drift" : "motion-safe:animate-doodle-pop",
    className,
  );

  switch (kind) {
    case "ball":
      return <span className={cn(base, "rounded-full", c.fill)} style={style} />;
    case "half":
      // 반원: 위쪽만 둥근 납작한 상자
      return <span className={cn(base, "aspect-2/1 rounded-t-full", c.fill)} style={style} />;
    case "arc":
      // 굵은 호: 테두리 두 변만 칠한 원 (히어로 주황 · 노랑 반원과 같은 방식)
      return (
        <span
          className={cn(
            base,
            "rounded-full border-(length:--arc) border-t-transparent border-r-transparent",
            c.border,
          )}
          style={style}
        />
      );
    case "tile":
      return <span className={cn(base, "rounded-3xl", c.fill)} style={style} />;
    case "pill":
      // 기울어진 알약 (히어로 흰 평행사변형)
      return <span className={cn(base, "skew-x-[-30deg] rounded-2xl", c.fill)} style={style} />;
    case "sun":
    case "gear":
      return (
        <svg viewBox="0 0 100 100" className={cn(base, c.text)} style={style}>
          <polygon fill="currentColor" points={kind === "sun" ? SUN_POINTS : GEAR_POINTS} />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" className={cn(base, c.text)} style={style}>
          <path
            fill="currentColor"
            d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"
          />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className={cn(base, c.text)} style={style}>
          <path
            fill="currentColor"
            d="M12 78 L52 14 Q58 6 64 14 L94 72 Q98 82 86 84 L22 90 Q6 90 12 78z"
          />
        </svg>
      );
    case "wave":
      // 물결: 굵고 끝이 둥근 지그재그 선
      return (
        <svg viewBox="0 0 120 40" className={cn(base, "overflow-visible", c.text)} style={style}>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 28 Q21 4 36 20 T66 20 T96 20 T114 14"
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={cn(base, "overflow-visible", c.text)} style={style}>
          <path
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinejoin="round"
            d="M12 21.4 10.6 20C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21.4z"
          />
        </svg>
      );
  }
}

/** 화면 가장자리에 걸치는 도형은 모바일에서 작게 — 크기 · 위치는 preset 마다 직접 적는다 */
const PRESETS = {
  // 활동 기록: 가운데 정렬 섹션이라 양옆이 비어 있다
  stats: [
    {
      kind: "sun",
      color: "yellow",
      delay: 0,
      className: "top-[14%] -left-10 size-24 md:-left-14 md:size-40",
    },
    {
      kind: "arc",
      color: "blue",
      delay: 1.5,
      className:
        "top-[2%] -right-14 size-24 rotate-[200deg] [--arc:12px] md:top-[8%] md:-right-16 md:size-48 md:[--arc:24px]",
    },
    {
      kind: "tile",
      color: "purple",
      delay: 2.4,
      className: "right-[7%] bottom-[14%] hidden h-14 w-24 rotate-12 md:block",
    },
    {
      kind: "ball",
      color: "green",
      delay: 3.1,
      className: "bottom-[16%] left-[6%] hidden size-20 md:block",
    },
  ],
  // What We Do: 카드가 한 줄 가득이라 위아래 여백과 양 끝만 쓴다
  about: [
    {
      kind: "half",
      color: "red",
      delay: 0.8,
      className: "top-[38%] -right-8 w-20 -rotate-90 md:-right-12 md:w-32",
    },
    {
      kind: "triangle",
      color: "green",
      delay: 2,
      className: "bottom-[2%] -left-5 size-16 -rotate-12 md:bottom-[5%] md:-left-6 md:size-28",
    },
    {
      kind: "sparkle",
      color: "blue",
      delay: 3.3,
      className: "top-[10%] right-[24%] hidden size-9 md:block",
    },
  ],
  // Projects: 오른쪽 위 물결, 양 끝 아래에 톱니 · 공
  projects: [
    {
      kind: "wave",
      color: "yellow",
      delay: 1,
      className: "top-[9%] right-[22%] hidden w-28 rotate-[-8deg] md:block",
    },
    {
      kind: "gear",
      color: "purple",
      delay: 0.2,
      className: "-bottom-8 -left-10 size-20 md:-bottom-14 md:-left-12 md:size-32",
    },
    {
      kind: "ball",
      color: "blue",
      delay: 2.6,
      className: "-right-6 bottom-[8%] size-14 md:-right-8 md:size-24",
    },
  ],
  // Studies: 왼쪽 위 빨간 호, 오른쪽 위 반짝이, 오른쪽 아래 노란 알약
  studies: [
    {
      kind: "arc",
      color: "red",
      delay: 1.8,
      className:
        "-bottom-10 -left-14 size-28 rotate-[20deg] [--arc:14px] md:-bottom-16 md:-left-20 md:size-44 md:[--arc:22px]",
    },
    {
      kind: "sparkle",
      color: "green",
      delay: 0.6,
      className: "top-[12%] right-[6%] size-8 md:right-[18%] md:size-11",
    },
    {
      kind: "pill",
      color: "yellow",
      delay: 2.9,
      className: "right-[5%] bottom-[10%] hidden h-10 w-28 rotate-[16deg] md:block",
    },
  ],
  // Upcoming Events: 오른쪽 아래 해, 왼쪽 아래 반원, 위쪽 작은 하트
  events: [
    {
      kind: "sun",
      color: "blue",
      delay: 2.2,
      className: "-right-10 bottom-[10%] size-24 md:-right-12 md:size-36",
    },
    {
      kind: "half",
      color: "green",
      delay: 0.4,
      className: "-bottom-1 left-[6%] w-24 md:left-[12%] md:w-36",
    },
    {
      kind: "heart",
      color: "purple",
      delay: 1.3,
      className: "top-[12%] right-[30%] hidden size-10 rotate-12 md:block",
    },
  ],
  // Projects 파란 프레임 위쪽 띠 (rem 위치). 카드가 다 올라온 뒤 하나씩 나타난다 (at)
  projectsFrame: [
    {
      kind: "sun",
      color: "yellow",
      delay: 0.3,
      at: 1.35,
      className: "top-3 left-[4%] size-12 md:top-5 md:size-16",
    },
    {
      kind: "sparkle",
      color: "white",
      delay: 1.1,
      at: 1.5,
      className: "top-10 left-[20%] size-5 md:size-7",
    },
    {
      kind: "arc",
      color: "red",
      delay: 2,
      at: 1.45,
      className: "top-5 left-[34%] hidden size-14 rotate-[160deg] [--arc:9px] md:block",
    },
    {
      kind: "tile",
      color: "purple",
      delay: 2.8,
      at: 1.6,
      className: "top-9 left-[56%] hidden h-6 w-10 rotate-12 md:block",
    },
    {
      kind: "triangle",
      color: "yellow",
      delay: 0.8,
      at: 1.55,
      className: "top-4 right-[28%] size-9 -rotate-12 md:top-6 md:size-12",
    },
    {
      kind: "ball",
      color: "green",
      delay: 1.7,
      at: 1.4,
      className: "top-7 right-[7%] size-8 md:top-9 md:size-12",
    },
  ],
  // Projects 흰 카드 영역 안 — 머리말 오른쪽 빈 곳, 섹션 사이, 카드 바깥 아래 (높이는 흰 영역 기준 %).
  // 머리말 흰 배경에 가리지 않게 front 층으로 그린다. 글자 위에는 두지 않는다
  projectsSheet: [
    {
      kind: "sun",
      color: "blue",
      delay: 0.6,
      at: 1.5,
      className: "top-[3%] right-[6%] size-14 md:size-24",
    },
    {
      kind: "sparkle",
      color: "yellow",
      delay: 2.3,
      at: 1.65,
      className: "top-[6%] right-[22%] hidden size-9 md:block",
    },
    {
      kind: "half",
      color: "green",
      delay: 1.4,
      at: 1.75,
      className: "top-[67%] left-[40%] hidden w-16 md:block",
    },
    {
      kind: "triangle",
      color: "red",
      delay: 3,
      at: 1.85,
      className: "right-[3%] bottom-[3%] size-10 rotate-12 md:size-14",
    },
    {
      kind: "ball",
      color: "purple",
      delay: 2.1,
      at: 1.9,
      className: "bottom-[6%] left-[46%] hidden size-10 md:block",
    },
  ],
  // About 컬러 배경: 흰 원형 영역이 덮지 않는 위쪽 · 둥근 어깨 자리에만 둔다 (페이지 전체 높이 기준이라 % 대신 rem)
  aboutBackdrop: [
    {
      kind: "sun",
      color: "yellow",
      delay: 0,
      className: "-top-16 -left-16 size-44 md:-top-28 md:-left-24 md:size-96",
    },
    {
      kind: "ball",
      color: "green",
      delay: 1.4,
      className: "top-6 right-[10%] size-12 md:top-10 md:size-24",
    },
    {
      kind: "arc",
      color: "red",
      delay: 2.2,
      className:
        "top-20 -right-16 size-36 rotate-[120deg] [--arc:16px] md:top-36 md:-right-24 md:size-72 md:[--arc:34px]",
    },
    {
      kind: "half",
      color: "purple",
      delay: 3,
      className: "top-[13rem] -left-12 hidden w-40 rotate-90 md:block",
    },
    {
      kind: "sparkle",
      color: "white",
      delay: 0.7,
      className: "top-10 left-[30%] size-7 md:top-14 md:size-11",
    },
    {
      kind: "sparkle",
      color: "white",
      delay: 2.6,
      className: "top-24 right-[32%] hidden size-6 md:block",
    },
  ],
} satisfies Record<string, DoodleProps[]>;

export type SectionDoodlesPreset = keyof typeof PRESETS;

export default function SectionDoodles({
  preset,
  front = false,
}: {
  preset: SectionDoodlesPreset;
  /**
   * true 면 콘텐츠 뒤(-z-10)가 아니라 문서 순서대로 그린다 — 배경색만 있는 머리말 등에 가려지지 않는다.
   * 뒤에 오는 카드 같은 위치 지정 요소는 여전히 위에 온다. 글자 위에 도형을 두지 않을 때만 쓴다
   */
  front?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      // 섹션 높이 × 화면 전체 폭. 넘치는 도형은 여기서 잘린다 (가로 넘침은 페이지 쪽 overflow-x-clip 도 막는다)
      className={cn(
        "pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden",
        !front && "-z-10",
      )}
    >
      {PRESETS[preset].map((doodle, index) => (
        <Doodle key={index} {...doodle} />
      ))}
    </div>
  );
}
