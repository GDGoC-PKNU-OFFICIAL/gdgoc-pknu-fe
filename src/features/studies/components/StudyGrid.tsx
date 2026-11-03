import EmptyState from "@/components/common/EmptyState";
import type { Study } from "@/types/api";

import { studyAnchorId } from "../lib/study-links";

import StudyCard from "./StudyCard";

interface StudyGridProps {
  studies: Study[];
  /** 0건일 때 문구 (IA 10-3) */
  emptyMessage: string;
}

/** 스터디 그리드 (P-03 #2 · #3, 홈). 모바일 1열 · 태블릿 2열 · 데스크톱 3열 (IA 5-7) */
export default function StudyGrid({ studies, emptyMessage }: StudyGridProps) {
  if (studies.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {studies.map((study) => (
        // 홈 큰 카드가 이 id 로 바로 찾아온다 (studyHref)
        <li key={study.id} id={studyAnchorId(study.slug)}>
          <StudyCard study={study} />
        </li>
      ))}
    </ul>
  );
}
