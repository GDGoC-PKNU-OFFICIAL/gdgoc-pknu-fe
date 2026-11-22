import { type ReactNode } from "react";

import SectionDoodles, { type SectionDoodlesPreset } from "@/components/common/SectionDoodles";

/**
 * 세로 물결 한 줄 — 같은 모양 두 번(세로 2880 = 1440 × 2)을 이어 그려, 절반만큼 위로 옮기면 처음 모양과 똑같아진다(끊김 없이 출렁임).
 * 오른쪽(파란 덮개 쪽)을 칠하고 왼쪽 가장자리가 부드러운 곡선이다. 2차 베지어(T)로 이어 각지지 않는다.
 */
const WAVE_LINE =
  "M40 0 Q4 180 40 360 T40 720 T40 1080 T40 1440 T40 1800 T40 2160 T40 2520 T40 2880";

/** 곡선 오른쪽(파란 덮개 쪽)을 칠한 면 — 왼쪽 가장자리가 흰 파도의 앞면이 된다 */
function Wave({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 96 2880"
      preserveAspectRatio="none"
      className={`absolute top-0 h-[200%] ${className}`}
    >
      <path fill="currentColor" d={`${WAVE_LINE} H96 V0 Z`} />
    </svg>
  );
}

/**
 * 흰 영역 윗변 — 화면 끝에서 끝까지 이어지는 큰 물결 (왼쪽 끝에서 올라와 한 번 솟고, 가운데서 살짝 내려갔다가,
 * 오른쪽에서 다시 솟은 뒤 오른쪽 끝으로 둥글게 내려간다). 아래쪽(흰 영역 쪽)을 칠한다. 가로로 늘려 쓴다(preserveAspectRatio none).
 */
const TOP_EDGE_PATH =
  "M0 180 V150 C0 96 40 66 120 52 C300 20 460 24 620 40 C820 60 980 58 1120 32 C1240 10 1340 6 1390 34 C1426 54 1440 92 1440 150 V180 Z";

interface WaveCanvasProps {
  /** 파란 띠 위쪽 장식 (처음부터 떠다닌다) */
  framePreset: SectionDoodlesPreset;
  /** 흰 영역 머리말 오른쪽 장식 (카드가 다 나온 뒤 나타난다) */
  sheetPreset: SectionDoodlesPreset;
  children: ReactNode;
}

/**
 * Projects · Studies 페이지 틀 — About(AboutCanvas)과 같은 Google 블루 배경 위에, 윗변이 큰 물결 모양인 흰 영역을 화면 폭 가득 깐다.
 * 장식은 홈 · About 과 같은 도형(SectionDoodles — 해 · 공 · 호 · 반짝이 · 세모)을 파란 띠 위쪽과 흰 영역 머리말 오른쪽에 둔다.
 * 두 페이지는 도형 배치(preset)만 다르다.
 *
 * 들어올 때 (About 은 "흰 원이 올라옴", Projects · Studies 는 "흰 파도가 덮침") — 약 2.7초:
 *   0 ~ 0.3초    파란 배경과 위쪽 도형만 (도형은 처음부터 둥둥 떠다닌다)
 *   0.3 ~ 1.7초  흰 영역(물결 윗변 포함)을 덮은 파란 덮개가 오른쪽으로 빠진다. 덮개 왼쪽 가장자리가 위아래로 출렁이는
 *                세로 물결이라 흰 파도가 왼쪽에서 오른쪽으로 덮쳐 흰 영역을 드러내는 것처럼 보인다 (wave-sweep + wave-sway-y)
 *   1.25초 ~     페이지 제목 → 설명 → 섹션 제목이 떠오른다 (globals.css 의 [data-wave-intro] 규칙)
 *   1.7초 ~      카드가 왼쪽부터 하나씩 올라온다 (card-in — Projects 는 card-entrance.ts, Studies 는 globals.css 가 순서대로 지연을 준다)
 *   2.3초 ~      머리말 오른쪽 장식 도형이 톡 나타나 떠다닌다
 * 모두 CSS 애니메이션이다. 덮개는 끝나면 흰 영역 위 바깥에 머물러(overflow-clip) 보이지 않고 클릭도 막지 않으며,
 * 나머지는 끝나면 스타일을 남기지 않아 기존 레이아웃 그대로다. "모션 줄이기"면 덮개 없이 처음부터 제자리.
 */
export default function WaveCanvas({ framePreset, sheetPreset, children }: WaveCanvasProps) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue pt-16 md:pt-20">
      <SectionDoodles preset={framePreset} />

      {/* 물결 윗변 + 흰 본문을 한 덩어리로 묶어, 덮개가 둘을 함께 덮었다가 드러낸다 (윗변의 물결 바깥은 투명해 파란 배경이 보인다) */}
      <div data-wave-intro className="relative isolate overflow-clip">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="-mb-px block h-20 w-full text-surface drop-shadow-[0_-4px_12px_rgba(11,18,32,0.1)] md:h-[clamp(7rem,11vw,10rem)]"
        >
          <path fill="currentColor" d={TOP_EDGE_PATH} />
        </svg>
        {/* 물결 끝자락과 살짝 겹쳐 머리말을 물결 가까이 올린다 (겹치는 곳은 물결 양 끝보다 아래라 둘 다 흰색) */}
        <div className="relative isolate -mt-3 bg-surface md:-mt-6">
          <SectionDoodles preset={sheetPreset} front />
          {children}
        </div>

        {/*
          파도 덮개 — 화면 높이만큼 흰 영역을 파랗게 덮고 있다가 오른쪽으로 빠진다.
          왼쪽 가장자리가 위아래로 출렁이는 물결(흰 파도의 앞면)이다. 처음엔 왼쪽 밖이라 보이지 않는다
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh overflow-visible text-brand-blue motion-safe:animate-wave-sweep motion-reduce:hidden"
        >
          <div className="absolute inset-0 bg-current" />
          <div className="absolute top-0 right-[calc(100%-1px)] h-full w-12 overflow-hidden md:w-20">
            <Wave className="right-0 w-full motion-safe:animate-wave-sway-y" />
          </div>
        </div>
      </div>
    </div>
  );
}
