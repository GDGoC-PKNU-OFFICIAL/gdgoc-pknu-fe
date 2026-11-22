import CardPager from "@/components/common/CardPager";
import EmptyState from "@/components/common/EmptyState";
import type { Project } from "@/types/api";

import ProjectCard from "./ProjectCard";

/** 한 쪽에 보여 줄 카드 수 — 데스크톱 3열 × 2줄 (/studies 의 진행 중 스터디와 같다) */
const PAGE_SIZE = 6;

interface CurrentProjectGridProps {
  /** 이미 최신순으로 정렬된 진행 중 프로젝트 */
  projects: Project[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/**
 * 진행 중 프로젝트 (P-02 #2). 태블릿 2열 · 데스크톱 3열 그리드를 6장씩 쪽으로 나눠
 * 스와이프 · 가로 스크롤과 좌우 버튼으로 넘긴다. 모바일은 한 줄로 이어 옆으로 넘긴다 (CardPager).
 */
export default function CurrentProjectGrid({ projects, emptyMessage }: CurrentProjectGridProps) {
  if (projects.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <CardPager label="진행 중 프로젝트" pageSize={PAGE_SIZE}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </CardPager>
  );
}
