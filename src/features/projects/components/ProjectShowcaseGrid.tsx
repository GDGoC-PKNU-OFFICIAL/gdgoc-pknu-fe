import { type CSSProperties } from "react";

import EmptyState from "@/components/common/EmptyState";
import RevealOnScroll from "@/components/common/RevealOnScroll";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/api";

import ProjectShowcaseCard, { type ShowcaseLayout } from "./ProjectShowcaseCard";

interface ProjectShowcaseGridProps {
  projects: Project[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/**
 * 잡지형 배치 — 카드가 정확히 3장일 때. 모든 카드가 사진 카드라 전체가 반듯한 직사각형이 된다.
 *
 *   태블릿 · 데스크톱 (폭 3 : 2)        모바일 (1번은 한 줄, 2 · 3번은 비율 그대로 작게 한 줄에 둘)
 *   ┌──────────────┬──────────┐        ┌──────────┐
 *   │              │ 2 (16:9) │        │  1 (4:3) │
 *   │   1 (4:3)    ├──────────┤        ├────┬─────┤
 *   │              │ 3 (16:9) │        │2   │3    │
 *   └──────────────┴──────────┘        └────┴─────┘
 *
 * 왼쪽 4:3 높이(3/4 × 3) = 오른쪽 16:9 두 장 높이(9/16 × 2 × 2) — 폭을 3 : 2 로 나누면 높이가 맞는다.
 * 오른쪽 두 장이 줄 높이를 정하고, 왼쪽 카드는 그 높이를 채운다 (칸 사이 간격만큼만 4:3 에서 어긋난다).
 */
const MAGAZINE: { layout: ShowcaseLayout; cell: string }[] = [
  { layout: "feature", cell: "col-span-2 md:col-span-1 md:row-span-2" },
  { layout: "tile", cell: "" },
  { layout: "tile", cell: "" },
];

/**
 * 홈 진행 중 프로젝트 (P-00 #4). 3장이면 잡지형 배치, 그보다 적으면 같은 크기 카드를
 * 모바일 1열 · 태블릿 2열 · 데스크톱 3열로 둔다 (IA 5-7).
 */
export default function ProjectShowcaseGrid({ projects, emptyMessage }: ProjectShowcaseGridProps) {
  if (projects.length === 0) return <EmptyState message={emptyMessage} />;

  const magazine = projects.length === MAGAZINE.length;

  // 스크롤해서 화면에 들어오면 카드가 순서대로(0.1초 간격) 아래에서 떠오른다 — 처음 한 번만 (RevealOnScroll)
  return (
    <RevealOnScroll>
      <ul
        className={cn(
          "grid gap-6",
          magazine
            ? "grid-cols-2 gap-3 md:grid-cols-[3fr_2fr] md:gap-6"
            : "auto-rows-fr md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {projects.map((project, index) => {
          const slot = magazine ? MAGAZINE[index] : undefined;
          return (
            <li
              key={project.id}
              data-reveal-item
              style={{ "--reveal-order": index } as CSSProperties}
              className={slot?.cell}
            >
              <ProjectShowcaseCard project={project} layout={slot?.layout} />
            </li>
          );
        })}
      </ul>
    </RevealOnScroll>
  );
}
