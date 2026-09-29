import EmptyState from "@/components/common/EmptyState";
import type { Project } from "@/types/api";

import ProjectCard from "./ProjectCard";

interface CurrentProjectGridProps {
  projects: Project[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/** 진행 중 프로젝트 그리드 (P-02 #2). 모바일 1열 · 태블릿 2열 · 데스크톱 3열 (IA 5-7) */
export default function CurrentProjectGrid({ projects, emptyMessage }: CurrentProjectGridProps) {
  if (projects.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
