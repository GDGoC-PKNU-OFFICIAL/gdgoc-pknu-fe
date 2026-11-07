import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/api";

import {
  DEFAULT_PROJECT_IMAGE,
  PROJECT_CATEGORY_TONES,
  PROJECT_STATUS_LABELS,
} from "../lib/project-labels";
import { projectDetailHref } from "../lib/project-query";

/** 카드 앞면에 보여 줄 기술 스택 수. 나머지는 "+n" (IA 5-2) */
const VISIBLE_TECH_COUNT = 3;
/** 상세 정보에 보여 줄 주요 기능 수 */
const VISIBLE_FEATURE_COUNT = 3;

const STATUS_DOT = { current: "bg-brand-green", past: "bg-ink-muted" } as const;

/** 마우스 · 키보드 포커스 때 상세 정보를 보여 주는 조건 */
const REVEAL = "group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100";
const RISE = "group-hover:translate-y-0 group-has-[a:focus-visible]:translate-y-0";

/**
 * 홈 진행 중 프로젝트 카드 (P-00 #4). 서버 컴포넌트다. /projects 의 카드는 ProjectCard 를 그대로 쓴다.
 *
 * 마우스를 올리거나 키보드로 포커스하면 카드 안에 어두운 오버레이가 덮이며 상세 설명 · 주요 기능 · 기술 스택이 나온다.
 * 카드 크기는 그대로다. 마우스가 없는 화면(터치)은 오버레이 대신 같은 정보를 카드 아래쪽에 처음부터 보여 준다.
 * 카드를 누르면 /projects 의 상세 카드로 간다 (projectDetailHref).
 */
export default function ProjectShowcaseCard({ project }: { project: Project }) {
  const { slug, title, summary, description, category, status, period, techStack, features } =
    project;
  const visibleTech = techStack.slice(0, VISIBLE_TECH_COUNT);
  const hiddenTechCount = techStack.length - visibleTech.length;
  const visibleFeatures = features.slice(0, VISIBLE_FEATURE_COUNT);
  const lead = description[0];
  const periodText = period.end ? `${period.start} – ${period.end}` : `${period.start} –`;

  const details = (tone: "dark" | "light") => (
    <>
      {lead && (
        <p
          className={cn(
            "line-clamp-3 text-sm leading-relaxed break-keep",
            tone === "dark" ? "text-white/85" : "text-ink-muted",
          )}
        >
          {lead}
        </p>
      )}
      {visibleFeatures.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {visibleFeatures.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span
                aria-hidden="true"
                className={tone === "dark" ? "text-[#8ab4f8]" : "text-brand-blue"}
              >
                ✓
              </span>
              <span className="line-clamp-1 break-keep">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <article
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E1E4E8] bg-surface",
        "shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(31,31,31,0.45)]",
        "has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-blue",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-surface-muted">
        {/* 제목이 바로 아래 있으므로 장식 이미지로 둔다. 없으면 기본 이미지 (C-11) */}
        <SafeImage
          src={project.thumbnailUrl}
          fallbackSrc={DEFAULT_PROJECT_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 368px, (min-width: 768px) 50vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-has-[a:focus-visible]:scale-[1.03] motion-reduce:transition-none"
        />
      </div>

      {/* 오버레이가 덮일 때 앞면 글자는 숨겨 겹쳐 비치지 않게 한다 */}
      <div className="flex flex-1 flex-col gap-3 p-5 transition-opacity duration-300 group-hover:opacity-0 group-has-[a:focus-visible]:opacity-0 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-3">
          <Badge tone={PROJECT_CATEGORY_TONES[category]}>{PROJECT_CATEGORY_LABELS[category]}</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
            {PROJECT_STATUS_LABELS[status]}
          </span>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold break-keep">
          <Link
            href={projectDetailHref(slug)}
            className="outline-none after:absolute after:inset-0"
          >
            {title}
            <span className="sr-only"> 자세히 보기</span>
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm break-keep text-ink-muted">{summary}</p>
        <p className="text-sm text-ink-muted tabular-nums">{periodText}</p>

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

        {/* 터치 화면: hover 가 없으니 상세 정보를 처음부터 보여 준다 */}
        <div className="flex flex-col gap-3 border-t border-line pt-3 [@media(hover:hover)]:hidden">
          {details("light")}
        </div>
      </div>

      {/* 마우스 · 키보드: 카드 안을 덮는 상세 정보. 같은 내용이 앞면 · 링크 대상에 있어 스크린리더에서는 숨긴다 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 hidden flex-col justify-end gap-3 p-6 text-white [@media(hover:hover)]:flex",
          "bg-[linear-gradient(180deg,rgba(17,17,17,0.3)_0%,rgba(17,17,17,0.95)_40%,rgba(17,17,17,0.97)_100%)]",
          "opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
          REVEAL,
        )}
      >
        <span className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
        <div
          className={cn(
            "flex translate-y-2.5 flex-col gap-3 transition-transform duration-300 motion-reduce:transition-none",
            RISE,
          )}
        >
          <p className="text-lg font-semibold break-keep">{title}</p>
          {details("dark")}
          {techStack.length > 0 && (
            <p className="flex flex-wrap gap-1.5">
              {techStack.slice(0, 5).map((tech) => (
                <span key={tech} className="rounded-md bg-white/15 px-2 py-0.5 text-xs">
                  #{tech}
                </span>
              ))}
            </p>
          )}
          <p className="text-sm font-medium text-[#8ab4f8]">프로젝트 자세히 보기 →</p>
        </div>
      </div>
    </article>
  );
}
