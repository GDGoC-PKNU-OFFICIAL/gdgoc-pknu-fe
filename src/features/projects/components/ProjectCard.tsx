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
 * 카드 전체가 상세 카드를 여는 링크다. 제목 링크의 ::after 를 카드 전체로 늘린다 —
 * 카드를 통째로 <a> 로 감싸지 않으므로 스크린리더는 제목만 링크 이름으로 읽는다.
 * ProjectDetailController 가 data-project-detail 링크 클릭을 가로채 히스토리 push + 카드가 커지는 전환으로 연다 (IA 6-3).
 * 썸네일의 data-project-thumb 는 그 전환에서 시작 위치를 찾는 데 쓴다.
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, title, summary, category, period, techStack, thumbnailUrl } = project;
  const visibleTech = techStack.slice(0, VISIBLE_TECH_COUNT);
  const hiddenTechCount = techStack.length - visibleTech.length;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] hover:border-brand-blue hover:shadow-md has-[a:focus-visible]:border-brand-blue has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-blue/30">
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
        <h3 className="line-clamp-2 text-lg font-semibold break-keep">
          <Link
            href={projectDetailHref(slug)}
            scroll={false}
            data-project-detail={slug}
            className="outline-none after:absolute after:inset-0"
          >
            {title}
            <span className="sr-only"> 자세히 보기</span>
          </Link>
        </h3>
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
      </div>
    </article>
  );
}
