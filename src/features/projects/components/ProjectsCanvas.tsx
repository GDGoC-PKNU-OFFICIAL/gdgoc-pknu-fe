import { type CSSProperties, type ReactNode } from "react";

import SectionDoodles from "@/components/common/SectionDoodles";

/**
 * 물결 한 줄 — 같은 모양 두 번(2880 = 1440 × 2)을 이어 그려, 절반만큼 옆으로 옮기면 처음 모양과 똑같아진다(끊김 없이 출렁임).
 * 위쪽(파란 덮개 쪽)을 칠하고 아래쪽 가장자리가 부드러운 곡선이다. 2차 베지어(T)로 이어 각지지 않는다.
 */
const WAVE_PATH =
  "M0 0 H2880 V28 Q2700 60 2520 28 T2160 28 T1800 28 T1440 28 T1080 28 T720 28 T360 28 T0 28 Z";

function Wave({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 2880 64"
      preserveAspectRatio="none"
      className={`absolute left-0 w-[200%] ${className}`}
      style={style}
    >
      <path fill="currentColor" d={WAVE_PATH} />
    </svg>
  );
}

/**
 * Projects 페이지 틀 — About(AboutCanvas)과 같은 Google 블루 프레임에, 원형 대신 "카드" 같은 흰 영역을 둔다.
 * 흰 영역 위 모서리는 비대칭이다: 왼쪽은 넓고 완만한 곡선, 오른쪽은 작게 둥근 카드 모서리.
 * 장식은 홈 · About 과 같은 도형(SectionDoodles — 해 · 공 · 호 · 반짝이 · 세모)을 프레임 위쪽과 흰 영역 안 카드 바깥 여백에 둔다.
 *
 * 들어올 때 (About 은 "흰 원이 올라옴", Projects 는 "흰 물결이 차오름") — 약 2.7초:
 *   0 ~ 0.3초    파란 배경과 위쪽 도형만 (도형은 처음부터 둥둥 떠다닌다)
 *   0.3 ~ 1.7초  흰 영역을 덮은 파란 덮개가 위로 빠진다. 덮개 아래 가장자리가 좌우로 출렁이는 물결이라
 *                흰 물결이 아래에서 차올라 둥근 흰 영역을 드러내는 것처럼 보인다 (wave-rise + wave-sway)
 *   1.25초 ~     Projects 제목 → 설명 → 섹션 제목이 떠오른다 (globals.css 의 [data-projects-intro] 규칙)
 *   1.7초 ~      카드가 왼쪽부터 하나씩 올라온다 (card-in — CurrentProjectGrid · page.tsx 가 순서대로 지연을 준다)
 *   2.3초 ~      흰 영역 안 장식 도형이 톡 나타나 떠다닌다
 * 모두 CSS 애니메이션이다. 덮개는 끝나면 흰 영역 위 바깥에 머물러(overflow-clip) 보이지 않고 클릭도 막지 않으며,
 * 나머지는 끝나면 스타일을 남기지 않아 기존 레이아웃 그대로다. "모션 줄이기"면 덮개 없이 처음부터 제자리.
 */
export default function ProjectsCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue px-2 pt-20 pb-2 md:px-6 md:pt-28 md:pb-6">
      <SectionDoodles preset="projectsFrame" />

      <div
        data-projects-intro
        className="relative isolate overflow-clip rounded-tl-[7rem_4rem] rounded-tr-[1.75rem] rounded-b-4xl bg-surface shadow-[0_-16px_48px_rgba(11,18,32,0.22)] outline-2 -outline-offset-1 outline-transparent motion-safe:animate-sheet-shadow md:rounded-tl-[14rem_7rem] md:rounded-tr-[2.5rem]"
      >
        <SectionDoodles preset="projectsSheet" front />
        {children}

        {/* 물결 덮개 — 화면 높이만큼 흰 영역 위를 파랗게 덮고 있다가 위로 빠진다. 아래 가장자리 두 겹: 짙은 물결 + 앞서 가는 옅은 물마루 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh text-brand-blue motion-safe:animate-wave-rise motion-reduce:hidden"
        >
          <div className="absolute inset-0 bg-current" />
          <Wave className="top-[calc(100%-1px)] h-10 motion-safe:animate-wave-sway md:h-16" />
          <Wave
            className="top-[calc(100%-1.75rem)] h-12 text-white/25 motion-safe:animate-wave-sway md:top-[calc(100%-2.5rem)] md:h-20"
            // 반대 방향 · 다른 속도로 흘러 두 겹이 엇갈리며 출렁인다 (클래스 순서와 상관없이 인라인이 이긴다)
            style={{ animationDirection: "reverse", animationDuration: "3.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
