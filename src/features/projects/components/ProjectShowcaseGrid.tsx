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
 * 잡지형 배치 — 카드가 정확히 3장일 때. 첫 카드는 사진만 크게(2칸 × 2줄), 나머지 두 장은 오른쪽에 위아래로.
 *
 *   데스크톱 (3열)            태블릿 (2열)        모바일 (1열)
 *   ┌─────────────┬──────┐    ┌──────┬──────┐     ┌────┐
 *   │             │  2   │    │      │  2   │     │ 1  │
 *   │   1 (사진)  ├──────┤    │  1   ├──────┤     │ 2  │
 *   │             │  3   │    │      │  3   │     │ 3  │
 *   └─────────────┴──────┘    └──────┴──────┘     └────┘
 */
const MAGAZINE: { layout: ShowcaseLayout; cell: string }[] = [
  { layout: "photo", cell: "md:row-span-2 lg:col-span-2" },
  { layout: "standard", cell: "" },
  { layout: "standard", cell: "" },
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
          magazine ? "md:grid-cols-2 lg:grid-cols-3" : "auto-rows-fr md:grid-cols-2 xl:grid-cols-3",
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
