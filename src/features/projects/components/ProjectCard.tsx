import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { formatMonthPeriod } from "@/lib/date";
import type { Project } from "@/types/api";

import { DEFAULT_PROJECT_IMAGE, PROJECT_CATEGORY_TONES } from "../lib/project-labels";
import { projectDetailHref } from "../lib/project-query";

/** 카드에 보여 줄 기술 스택 수. 나머지는 "+n" (IA 5-2) */
const VISIBLE_TECH_COUNT = 3;

interface ProjectCardProps {
  project: Project;
}

/**
 * 프로젝트 카드 (C-02, IA 5-2). 서버 컴포넌트다.
 *
 * "자세히 보기"는 평범한 링크(/projects?project=slug)다.
 * - 홈 등 다른 페이지: 그대로 /projects 로 이동해 상세 카드가 열린다 (공유 링크 진입과 같은 동작)
 * - /projects 안: ProjectDetailController 가 data-project-detail 링크 클릭을 가로채
 *   히스토리 push + 카드가 커지는 전환으로 연다 (IA 6-3)
 * 썸네일의 data-project-thumb 는 그 전환에서 시작 위치를 찾는 데 쓴다.
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, title, summary, category, period, techStack, thumbnailUrl } = project;
  const visibleTech = techStack.slice(0, VISIBLE_TECH_COUNT);
  const hiddenTechCount = techStack.length - visibleTech.length;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div data-project-thumb={slug} className="relative aspect-video bg-surface-muted">
        {/* 제목이 바로 아래 있으므로 장식 이미지로 둔다 */}
        <SafeImage
          src={thumbnailUrl}
          fallbackSrc={DEFAULT_PROJECT_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 368px, (min-width: 768px) 50vw, 85vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Badge tone={PROJECT_CATEGORY_TONES[category]} className="self-start">
          {PROJECT_CATEGORY_LABELS[category]}
        </Badge>
        <h3 className="line-clamp-2 text-lg font-semibold break-keep">{title}</h3>
        <p className="line-clamp-2 text-sm break-keep text-ink-muted">{summary}</p>
        <p className="text-sm text-ink-muted tabular-nums">{formatMonthPeriod(period)}</p>

        {visibleTech.length > 0 && (
          <ul aria-label="기술 스택" className="flex flex-wrap gap-1.5">
            {visibleTech.map((tech) => (
              <li key={tech} className="max-w-full">
                <Tag>#{tech}</Tag>
              </li>
            ))}
            {hiddenTechCount > 0 && (
              <li>
                <Tag aria-label={`외 ${hiddenTechCount}개`}>+{hiddenTechCount}</Tag>
              </li>
            )}
          </ul>
        )}

        <Link
          href={projectDetailHref(slug)}
          scroll={false}
          data-project-detail={slug}
          className="mt-auto inline-flex min-h-11 items-center gap-1 self-end text-sm font-medium text-brand-blue hover:underline"
        >
          <span className="sr-only">{title} </span>자세히 보기
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
