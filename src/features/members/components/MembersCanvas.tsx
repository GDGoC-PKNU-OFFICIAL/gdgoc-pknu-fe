import { type ReactNode } from "react";

import SectionDoodles from "@/components/common/SectionDoodles";

/**
 * 흰 영역 윗변 — 가운데가 둥글게 솟은 큰 아치. 위는 둥글고 아래로 갈수록 양옆으로 넓게 펼쳐져 화면 끝에 닿는다.
 * 아래쪽(흰 영역 쪽)을 칠한다. 가로로 늘려 쓴다(preserveAspectRatio none).
 */
const ARCH_PATH =
  "M0 300 C160 300 250 270 330 200 C440 100 560 20 720 20 C880 20 1000 100 1110 200 C1190 270 1280 300 1440 300 Z";

interface MembersCanvasProps {
  /** h1 — 태블릿 이상은 아치 꼭대기 아래 가운데에, 모바일은 아치 바로 아래에 놓인다 */
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Members 페이지 틀 — About · Projects · Events 와 같은 Google 블루 배경(옐로 · 레드 · 그린 색 덩어리)에,
 * 흰 영역을 가운데가 둥글게 솟은 큰 아치로 둔다. 멤버들이 한 지붕 아래 모인 느낌.
 *
 * 들어올 때 (About 은 "흰 원", Projects · Studies 는 "파도", Events 는 "티켓", Members 는 "모여듦"):
 *   0 ~ 0.5초    파란 배경 위에 큰 색 도형이 차례로 톡 튀어나와 멈춘다 (settle)
 *   0.25초 ~     흰 아치가 화면 아래에서 "뽀용" 올라와 자리 잡는다 (sheet-rise — About · Events 와 같은 움직임)
 *   1.05초 ~     제목 → 설명 → 섹션 제목이 떠오른다
 *   1.2초 ~      멤버 카드가 한 장씩 모여든다 — 화면 왼쪽 카드는 왼쪽에서, 오른쪽 카드는 오른쪽에서, 가운데 카드는 아래에서
 *                (member-in, 끝에서 살짝 넘쳤다 제자리). 카드 · 사진 둘레에는 도형을 넣지 않는다
 *   (globals.css 의 [data-members-intro] 규칙 — 슬라이드 · 카드 컴포넌트는 순서를 모른다)
 * 끝나면 아무것도 움직이지 않는다. 배경 도형은 클릭을 막지 않는다. "모션 줄이기"면 처음부터 제자리.
 */
export default function MembersCanvas({ title, description, children }: MembersCanvasProps) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue pt-12 md:pt-16">
      <SectionDoodles preset="membersFrame" />

      <div
        data-members-intro
        className="relative drop-shadow-[0_-10px_28px_rgba(11,18,32,0.16)] motion-safe:animate-sheet-rise"
      >
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 300"
            preserveAspectRatio="none"
            className="-mb-px block h-32 w-full text-surface md:h-[clamp(14rem,22vw,20rem)]"
          >
            <path fill="currentColor" d={ARCH_PATH} />
          </svg>
          {/* 태블릿 이상: 아치 안쪽 아래에 겹쳐 가운데 정렬 / 모바일: 아치 바로 아래 흰 바탕 위 */}
          <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 bg-surface px-6 pt-2 text-center md:absolute md:inset-x-0 md:bottom-4 md:bg-transparent md:pt-0">
            <h1 className="font-nav text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
            <p className="text-base break-keep text-ink-muted md:text-lg">{description}</p>
          </header>
        </div>
        <div className="bg-surface pb-8">{children}</div>
      </div>
    </div>
  );
}
