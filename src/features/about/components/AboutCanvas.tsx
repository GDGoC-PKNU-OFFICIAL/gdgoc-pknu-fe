import { type ReactNode } from "react";

import SectionDoodles from "@/components/common/SectionDoodles";

interface AboutCanvasProps {
  /** h1 — 흰 원형 영역 맨 위 가운데에 놓인다 */
  title: string;
  /** 제목 아래 한 줄 설명 */
  description: string;
  /** About 본문 섹션들 */
  children: ReactNode;
}

/**
 * About 페이지 틀 — Google 블루 컬러 배경 위에 큰 흰 원형(위가 반원처럼 둥근) 영역이 파고들어 콘텐츠를 담는다.
 *
 *   ┌──────── 블루 + 해 · 공 · 호 도형 ────────┐
 *   │        ╭───────── About ─────────╮       │  ← 위 가장자리는 가로 50% · 세로 --arch 의 타원 곡선
 *   │      ╭╯                         ╰╮      │
 *   │      │  Who We Are · What We Do …  │      │  ← 양옆 · 아래로도 컬러가 얇게 감싼다
 *   │      ╰─────────────────────────────╯      │
 *   └───────────────────────────────────────────┘
 *
 * 들어올 때: 처음 0.25초는 컬러 배경만 보이고, 흰 영역이 화면 아래에서 "뽀용" 하고 올라와(살짝 넘쳤다 제자리) 자리 잡는다.
 * 흰 영역이 거의 다 올라오면 제목부터 맨 아래 FAQ 까지 안의 내용 전부가 한꺼번에 같은 속도로 흐림 → 선명해진다(content-in).
 * 스크롤할 때 따로 나타나는 효과는 없다. "모션 줄이기"면 처음부터 제자리다. CSS 만 쓰므로 JS 없이도 같은 화면이다.
 * 올라오는 동안 페이지가 길어지지 않게 바깥 틀에서 넘침을 잘라 낸다(overflow-clip).
 *
 * 곡선 높이(--arch)는 화면 폭에 따라 9 ~ 20rem. 왼쪽 정렬 섹션 제목이 곡선에 걸리지 않도록,
 * 가운데 머리말 아래로 첫 섹션이 충분히 내려와 있다 (머리말 위 여백 + 섹션 위 여백 > 곡선이 왼쪽 끝에서 내려오는 높이).
 */
export default function AboutCanvas({ title, description, children }: AboutCanvasProps) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue px-2 pt-24 pb-2 md:px-6 md:pt-36 md:pb-6">
      <SectionDoodles preset="aboutBackdrop" />

      <div className="rounded-tl-[50%_var(--arch)] rounded-tr-[50%_var(--arch)] rounded-b-4xl bg-surface shadow-[0_-16px_48px_rgba(11,18,32,0.22)] [--arch:clamp(9rem,28vw,20rem)] motion-safe:animate-sheet-rise">
        <div className="motion-safe:animate-content-in">
          <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 pt-16 text-center md:pt-24">
            <h1 className="font-nav text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
            <p className="text-base break-keep text-ink-muted md:text-lg">{description}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
