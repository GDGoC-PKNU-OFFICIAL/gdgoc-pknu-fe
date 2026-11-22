// src/features/projects/lib/card-entrance.ts
// /projects 진입 때 카드가 왼쪽부터 하나씩 올라오는 순서 (ProjectsCanvas 의 card-in 단계).
// 흰 영역이 생긴 뒤(0.95초) 시작해 한 장에 0.07초씩 늦춘다. 화면 밖 카드까지 기다리지 않도록 8장째부터는 같은 시각.

import { type CSSProperties } from "react";

const START_SECONDS = 0.95;
const STEP_SECONDS = 0.07;
const MAX_STEPS = 8;

/** 카드를 감싸는 요소에 펼쳐 넣는다 — h-full 로 카드 높이 맞춤(CardPager · CardSlider 칸)을 유지한다 */
export function cardEntrance(index: number): { className: string; style: CSSProperties } {
  const delay = START_SECONDS + Math.min(index, MAX_STEPS) * STEP_SECONDS;
  return {
    className: "h-full motion-safe:animate-card-in",
    style: { animationDelay: `${delay.toFixed(2)}s` },
  };
}
