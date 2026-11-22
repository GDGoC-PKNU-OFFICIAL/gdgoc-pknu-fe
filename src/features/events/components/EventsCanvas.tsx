import { type CSSProperties, type ReactNode } from "react";

import SectionDoodles from "@/components/common/SectionDoodles";

/**
 * 흰 영역 양옆을 반원으로 파낸다 — 왼쪽 · 오른쪽 가장자리의 같은 높이(--notch-y)에 반지름 --notch-r 인 구멍.
 * 두 마스크를 겹쳐(intersect) 둘 다 칠해진 곳만 남긴다. Safari 는 -webkit- 이름을 읽는다.
 */
const notch = (side: "left" | "right") =>
  `radial-gradient(circle var(--notch-r) at ${side} var(--notch-y), transparent calc(var(--notch-r) - 0.5px), #000 var(--notch-r))`;

const TICKET_MASK: CSSProperties = {
  maskImage: `${notch("left")}, ${notch("right")}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${notch("left")}, ${notch("right")}`,
  WebkitMaskComposite: "source-in",
};

/**
 * Events 페이지 틀 — About · Projects 와 같은 Google 블루 배경에, 흰 영역을 축제 입장권(티켓) 모양으로 둔다.
 *
 *   ┌──────── 블루 + 옐로 해 · 레드 반원 · 그린 공 · 지그재그 ────────┐
 *   │   ╭──────────────────────────────────────────────────╮    │
 *   │   │  Events                                          │    │  ← 머리말 = 티켓 꼬리
 *   │   ◖ - - - - - - - - - - 절취선 - - - - - - - - - - - ◗    │  ← 양옆 반원 홈 (--notch-y)
 *   │   │  Calendar · Schedule                             │    │
 *   │   ╰──────────────────────────────────────────────────╯    │
 *   └────────────────────────────────────────────────────────────┘
 *
 * 들어올 때 (About 은 "흰 원이 부드럽게", Events 는 "티켓이 올라오고 도형이 팡팡"):
 *   0 ~ 0.5초    파란 배경 위에 큰 색 도형이 차례로 톡 튀어나와 멈춘다 (settle)
 *   0.25초 ~     흰 티켓이 화면 아래에서 "뽀용" 올라와 자리 잡는다 (sheet-rise — About 과 같은 움직임)
 *   1.05초 ~     제목 · 설명 · 섹션 제목이 떠오르고, 일정 카드가 위에서부터 하나씩 올라온다
 *                카드 · 오늘 날짜 · 제목이 나타나는 순간 그 주변에 작은 별 · 점 · 세모 · 지그재그가 팡 튀어나와 멈춘다
 *                (globals.css 의 [data-events-intro] 규칙 — 캘린더 · 일정 컴포넌트는 고치지 않고 바깥에서 고른다)
 * 끝나면 아무것도 움직이지 않는다. 도형은 클릭을 막지 않는다. "모션 줄이기"면 처음부터 제자리.
 * 반원 홈 높이(--notch-y)는 머리말(PageHeader) 바로 아래에 맞춘다 — 모바일 py-12 · 태블릿 이상 py-16.
 */
export default function EventsCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue px-2 pt-24 pb-2 md:px-6 md:pt-36 md:pb-6">
      <SectionDoodles preset="eventsFrame" />

      {/* 그림자는 바깥에서 drop-shadow 로 — 티켓 마스크에 잘리지 않고 반원 홈 모양을 따라간다 */}
      <div className="drop-shadow-[0_-12px_32px_rgba(11,18,32,0.2)]">
        <div
          data-events-intro
          className="relative overflow-clip rounded-4xl bg-surface [--notch-r:1.25rem] [--notch-y:12rem] motion-safe:animate-sheet-rise md:[--notch-r:1.75rem] md:[--notch-y:14rem]"
          style={TICKET_MASK}
        >
          {/* 절취선 — 양옆 반원 홈 사이를 잇는 점선 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[calc(var(--notch-r)+0.75rem)] top-(--notch-y) border-t-2 border-dashed border-line"
          />
          {children}
        </div>
      </div>
    </div>
  );
}
