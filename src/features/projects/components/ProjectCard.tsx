import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import { formatMonthPeriod } from "@/lib/date";
import type { Project } from "@/types/api";

import { DEFAULT_PROJECT_IMAGE, projectBadge } from "../lib/project-labels";
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
  const { slug, title, summary, period, techStack, thumbnailUrl } = project;
  const badge = projectBadge(project);
  const visibleTech = techStack.slice(0, VISIBLE_TECH_COUNT);
  const hiddenTechCount = techStack.length - visibleTech.length;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md has-[a:focus-visible]:border-brand-blue has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-blue/30">
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

      {/*
        카드 규격을 맞추려고 글 칸 높이를 고정한다 — 제목 1줄, 설명 2줄 자리(짧아도 비워 둠),
        기술 스택은 한 줄만 보이고 구분선 아래 맨 밑에 붙는다. 그래서 어느 연도 · 줄에서도 카드 높이가 같다.
        제목(크고 굵은 검정)과 설명(작은 회색 · 줄 간격 넓게)을 크기 · 굵기 · 색으로 확실히 나눈다.
        띄어쓰기 없는 긴 영문 · 주소도 카드 밖으로 나가지 않게 아무 데서나 줄을 바꿀 수 있게 한다 (overflow-wrap: anywhere).
      */}
      <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Badge tone={badge.tone} className="min-w-0 truncate">
            {badge.label}
          </Badge>
          <span className="shrink-0 text-xs text-ink-muted tabular-nums">
            {formatMonthPeriod(period)}
          </span>
        </div>

        <h3
          className="mt-4 line-clamp-1 text-xl font-bold tracking-tight [overflow-wrap:anywhere] break-keep text-ink"
          title={title}
        >
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
        <p className="mt-2 line-clamp-2 min-h-[2lh] text-[15px] leading-relaxed [overflow-wrap:anywhere] break-keep text-ink-muted">
          {summary}
        </p>

        {/* 기술 스택이 없어도 같은 높이 자리를 둔다. 설명과는 최소 1.25rem 띄우고 남는 높이는 위로 보낸다 */}
        <div className="mt-auto pt-5">
          <div className="box-content h-5 border-t border-line pt-4">
            {visibleTech.length > 0 && (
              <ul aria-label="기술 스택" className="flex h-5 flex-wrap gap-1.5 overflow-hidden">
                {visibleTech.map((tech) => (
                  <li key={tech} className="max-w-full min-w-0">
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
        </div>
      </div>
    </article>
  );
}
