import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Tag from "@/components/ui/Tag";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/api";

import { DEFAULT_PROJECT_IMAGE, PROJECT_STATUS_LABELS } from "../lib/project-labels";
import { projectDetailHref } from "../lib/project-query";

/** 카드 앞면에 보여 줄 기술 스택 수. 나머지는 "+n" (IA 5-2) */
const VISIBLE_TECH_COUNT = 3;
/** 상세 정보에 보여 줄 주요 기능 수 */
const VISIBLE_FEATURE_COUNT = 3;

const STATUS_DOT = { current: "bg-brand-green", past: "bg-ink-muted" } as const;

/** 분류 글자 색 — 다른 카드의 분류 배지(PROJECT_CATEGORY_TONES)와 같은 색 계열 */
const CATEGORY_TEXT = {
  "solution-challenge": "text-brand-blue",
  "team-project": "text-[#1e7e34] dark:text-[#81c995]",
  official: "text-brand-red",
} satisfies Record<Project["category"], string>;

/** 마우스 · 키보드 포커스 때 상세 정보를 보여 주는 조건 */
const REVEAL = "group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100";

/**
 * 카드 모양 (ProjectShowcaseGrid).
 * - standard: 사진(16:9) 위 · 내용 아래 (기본, 3장이 아닐 때)
 * - feature · tile: 잡지형 배치. 카드 전체가 사진이고, 분류 · 제목은 사진 아래쪽 어두운 띠 위에 얹는다.
 *   카드 = 사진 비율이라 칸이 반듯하게 맞는다.
 *   - feature: 큰 카드. 모바일 4:3, 태블릿 이상은 오른쪽 두 장 높이를 채운다(폭 3 : 2 라 거의 정확히 4:3)
 *   - tile: 작은 카드. 항상 16:9
 */
export type ShowcaseLayout = "standard" | "feature" | "tile";

/** 사진이 실제로 그려지는 폭 (next/image sizes) */
const THUMB_SIZES = {
  standard: "(min-width: 1440px) 448px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 90vw",
  feature: "(min-width: 1440px) 830px, (min-width: 768px) 60vw, 90vw",
  tile: "(min-width: 1440px) 552px, (min-width: 768px) 40vw, 50vw",
} satisfies Record<ShowcaseLayout, string>;

const RISE = "group-hover:translate-y-0 group-has-[a:focus-visible]:translate-y-0";

/**
 * 홈 진행 중 프로젝트 카드 (P-00 #4). 서버 컴포넌트다. /projects 의 카드는 ProjectCard 를 그대로 쓴다.
 *
 * 마우스를 올리거나 키보드로 포커스하면 카드 안에 어두운 오버레이가 덮이며 상세 설명 · 주요 기능 · 기술 스택이 나온다.
 * 카드 크기는 그대로다. 마우스가 없는 화면(터치)은 오버레이 대신 같은 정보를 카드 아래쪽에 처음부터 보여 준다.
 * 카드를 누르면 /projects 의 상세 카드로 간다 (projectDetailHref).
 */
export default function ProjectShowcaseCard({
  project,
  layout = "standard",
}: {
  project: Project;
  layout?: ShowcaseLayout;
}) {
  const overlay = layout !== "standard";
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
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E1E4E8] bg-surface dark:border-line",
        "shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(31,31,31,0.45)]",
        "has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-blue",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-surface-muted",
          layout === "feature" ? "aspect-[4/3] md:aspect-auto md:flex-1" : "aspect-video",
        )}
      >
        {/* 제목이 바로 아래 있으므로 장식 이미지로 둔다. 없으면 기본 이미지 (C-11) */}
        <SafeImage
          src={project.thumbnailUrl}
          fallbackSrc={DEFAULT_PROJECT_IMAGE}
          alt=""
          fill
          sizes={THUMB_SIZES[layout]}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-has-[a:focus-visible]:scale-[1.03] motion-reduce:transition-none"
        />
      </div>

      {overlay ? (
        // 사진 카드: 아래쪽 어두운 띠 위에 분류 · 제목. 마우스 · 포커스 때는 상세 오버레이에 자리를 내준다
        <div
          className={cn(
            // 평소에는 사진이 어두워 보이지 않게 맨 아래 글자 뒤만 옅게 깔고, 글자 그림자로 읽히게 한다
            "absolute inset-x-0 bottom-0 flex flex-col text-white md:gap-1.5 md:p-6 md:pt-14",
            // 모바일 작은 칸(tile)은 여백 · 글자를 줄인다
            layout === "tile" ? "gap-0.5 p-3 pt-8" : "gap-1.5 p-5 pt-12",
            "bg-[linear-gradient(180deg,rgba(17,17,17,0)_0%,rgba(17,17,17,0.18)_50%,rgba(17,17,17,0.45)_100%)]",
            "[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]",
            "transition-opacity duration-300 motion-reduce:transition-none",
            "group-has-[a:focus-visible]:opacity-0 [@media(hover:hover)]:group-hover:opacity-0",
          )}
        >
          <span
            className={cn(
              "font-semibold text-white/85",
              layout === "tile" ? "text-[10px] md:text-xs" : "text-xs",
            )}
          >
            {PROJECT_CATEGORY_LABELS[category]}
          </span>
          <h3
            className={cn(
              "line-clamp-2 font-semibold [overflow-wrap:anywhere] break-keep",
              layout === "feature" ? "text-xl md:text-2xl" : "text-sm md:text-lg",
            )}
          >
            {/* 카드 전체를 덮는 링크 */}
            <Link
              href={projectDetailHref(slug)}
              className="outline-none after:absolute after:inset-0"
            >
              {title}
              <span className="sr-only"> 자세히 보기</span>
            </Link>
          </h3>
        </div>
      ) : (
        <>
          {/* 오버레이가 덮일 때 앞면 글자는 숨겨 겹쳐 비치지 않게 한다 */}
          <div
            className={cn(
              "flex min-w-0 flex-col gap-3 p-5 transition-opacity duration-300 group-hover:opacity-0 group-has-[a:focus-visible]:opacity-0 motion-reduce:transition-none",
              "flex-1",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              {/* 분류는 배경 없는 글자로만. 색은 분류별 배지 색을 그대로 쓴다 */}
              <span className={cn("text-xs font-semibold", CATEGORY_TEXT[category])}>
                {PROJECT_CATEGORY_LABELS[category]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", STATUS_DOT[status])}
                />
                {PROJECT_STATUS_LABELS[status]}
              </span>
            </div>
            {/* 긴 영문 · 띄어쓰기 없는 문자열도 카드 밖으로 넘치지 않게 어디서든 줄을 바꾼다 */}
            <h3
              className={cn(
                "line-clamp-2 font-semibold [overflow-wrap:anywhere] break-keep",
                "text-lg",
              )}
            >
              <Link
                href={projectDetailHref(slug)}
                className="outline-none after:absolute after:inset-0"
              >
                {title}
                <span className="sr-only"> 자세히 보기</span>
              </Link>
            </h3>
            <p className="line-clamp-2 text-sm [overflow-wrap:anywhere] break-keep text-ink-muted">
              {summary}
            </p>
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
        </>
      )}

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
        </div>
      </div>
    </article>
  );
}
