import { type CSSProperties, type ReactNode } from "react";

import SectionDoodles from "@/components/common/SectionDoodles";
import { cn } from "@/lib/cn";

/** 흰 영역 윗변으로 모여드는 작은 색 점 — [가로 위치 %, 출발 x, 출발 y, 색] */
const GATHER_PIXELS: [number, string, string, string][] = [
  [4, "-40px", "-70px", "bg-[#fbbc04]"],
  [11, "30px", "-90px", "bg-white"],
  [19, "-60px", "-50px", "bg-[#ea4335]"],
  [27, "50px", "-80px", "bg-[#34a853]"],
  [35, "-30px", "-100px", "bg-white"],
  [43, "70px", "-60px", "bg-[#fbbc04]"],
  [51, "-50px", "-90px", "bg-[#b98be8]"],
  [59, "40px", "-70px", "bg-white"],
  [67, "-70px", "-60px", "bg-[#ea4335]"],
  [75, "30px", "-100px", "bg-[#34a853]"],
  [83, "-40px", "-80px", "bg-white"],
  [91, "60px", "-60px", "bg-[#fbbc04]"],
  [97, "-30px", "-90px", "bg-[#b98be8]"],
];

/**
 * Projects 페이지 틀 — About(AboutCanvas)과 같은 Google 블루 프레임에, 원형 대신 "카드" 같은 흰 영역을 둔다.
 * 흰 영역 위 모서리는 비대칭이다: 왼쪽은 넓고 완만한 곡선, 오른쪽은 작게 둥근 카드 모서리.
 * 장식은 홈 · About 과 같은 도형(SectionDoodles — 해 · 공 · 호 · 반짝이 · 세모 · 반원)을 프레임 위쪽과 흰 영역 안 카드 바깥 여백에 둔다.
 *
 * 들어올 때 (About 은 "흰 원이 올라옴", Projects 는 "색 점이 모여 페이지가 만들어짐"):
 *   0 ~ 0.15초  파란 배경만
 *   ~0.6초      흩어진 작은 색 점이 흰 영역 윗변으로 모였다가 사라진다 (pixel-gather)
 *   0.55초 ~    그 자리에서 흰 영역이 살짝 아래에서 커지며 생긴다 (sheet-form)
 *   0.95초 ~    카드가 왼쪽부터 하나씩 올라온다 (card-in — CurrentProjectGrid · page.tsx 가 순서대로 지연을 준다)
 *   1.35초 ~    주변 장식 도형이 톡 나타나 둥둥 떠다닌다 (doodle-pop)
 * 모두 CSS 애니메이션이고 끝나면 스타일을 남기지 않아 기존 레이아웃 그대로다. "모션 줄이기"면 처음부터 제자리.
 * 흰 영역은 overflow-clip 으로 안쪽 머리말 배경까지 둥근 모서리에 맞춰 자른다.
 */
export default function ProjectsCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-clip bg-brand-blue px-2 pt-20 pb-2 md:px-6 md:pt-28 md:pb-6">
      <SectionDoodles preset="projectsFrame" />

      {/* ① 모여드는 색 점 — 흰 영역 윗변 높이에 줄지어 도착한다 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-20 h-0 motion-reduce:hidden md:inset-x-6 md:top-28"
      >
        {GATHER_PIXELS.map(([left, gx, gy, color], index) => (
          <span
            key={left}
            className={cn(
              "absolute top-0 size-2.5 -translate-1/2 rounded-full opacity-0 motion-safe:animate-pixel-gather md:size-3.5",
              color,
            )}
            style={
              {
                left: `${left}%`,
                "--gx": gx,
                "--gy": gy,
                animationDelay: `${(0.1 + index * 0.025).toFixed(3)}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative isolate overflow-clip rounded-tl-[7rem_4rem] rounded-tr-[1.75rem] rounded-b-4xl bg-surface shadow-[0_-16px_48px_rgba(11,18,32,0.22)] motion-safe:animate-sheet-form md:rounded-tl-[14rem_7rem] md:rounded-tr-[2.5rem]">
        <SectionDoodles preset="projectsSheet" front />
        {children}
      </div>
    </div>
  );
}
