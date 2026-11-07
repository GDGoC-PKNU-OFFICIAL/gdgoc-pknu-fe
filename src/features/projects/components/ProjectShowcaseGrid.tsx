import EmptyState from "@/components/common/EmptyState";
import type { Project } from "@/types/api";

import ProjectShowcaseCard from "./ProjectShowcaseCard";

interface ProjectShowcaseGridProps {
  projects: Project[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/** 홈 진행 중 프로젝트 그리드 (P-00 #4). 모바일 1열 · 태블릿 2열 · 데스크톱 3열, 칸 높이를 맞춘다 (IA 5-7) */
export default function ProjectShowcaseGrid({ projects, emptyMessage }: ProjectShowcaseGridProps) {
  if (projects.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectShowcaseCard project={project} />
        </li>
      ))}
    </ul>
  );
}
