"use client";

import { type ReactNode, type Ref, useId } from "react";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { formatMonthPeriod } from "@/lib/date";
import type { Project } from "@/types/api";

import {
  DEFAULT_PROJECT_IMAGE,
  PROJECT_CATEGORY_TONES,
  PROJECT_OUTCOMES_TITLES,
  PROJECT_STATUS_LABELS,
  PROJECT_THUMB_TRANSITION_NAME,
} from "../lib/project-labels";

interface ProjectDetailOverlayProps {
  ref: Ref<HTMLDialogElement>;
  /** null 이면 빈 <dialog> 만 둔다 (열고 닫기는 ProjectDetailController 가 showModal · close 로 한다) */
  project: Project | null;
  /** 닫기 버튼 · ESC · 바깥 클릭 — URL 처리까지 컨트롤러에 맡긴다 */
  onRequestClose: () => void;
  /** <dialog> 가 실제로 닫힌 뒤 (어떤 경로로 닫혔든) */
  onClose: () => void;
}

/**
 * 프로젝트 상세 카드 (C-08, IA 4장 P-02-D). 목록 응답에 상세 내용이 다 있어 추가 fetch 가 없다.
 * 네이티브 <dialog>.showModal() 로 포커스 가두기 · 뒤 페이지 inert 를 브라우저에 맡긴다 (PRD 3-3-D).
 * 모바일(< 768px) 전체 화면, 태블릿 이상 큰 모달, 데스크톱(≥ 1280px) 본문 + 사이드 정보 2단 (IA 5-7).
 */
export default function ProjectDetailOverlay({
  ref,
  project,
  onRequestClose,
  onClose,
}: ProjectDetailOverlayProps) {
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // ESC: 브라우저가 바로 닫지 않게 막고, 닫기 버튼과 같은 경로(URL 처리 + 전환)로 닫는다
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClose={onClose}
      // 바깥(::backdrop) 클릭은 target 이 <dialog> 자신이다. 안쪽 내용 클릭은 자식이 target 이다
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-surface p-0 text-ink backdrop:bg-ink/60 md:m-auto md:h-auto md:max-h-[90dvh] md:w-[min(56rem,calc(100vw-4rem))] md:rounded-2xl md:shadow-xl"
    >
      {project && (
        <ProjectDetailContent project={project} titleId={titleId} onRequestClose={onRequestClose} />
      )}
    </dialog>
  );
}

interface ProjectDetailContentProps {
  project: Project;
  titleId: string;
  onRequestClose: () => void;
}

function ProjectDetailContent({ project, titleId, onRequestClose }: ProjectDetailContentProps) {
  const {
    title,
    summary,
    category,
    status,
    period,
    description,
    team,
    techStack,
    features,
    outcomes,
    thumbnailUrl,
    links,
  } = project;
  const hasLinks = Boolean(links.github || links.demo);

  return (
    <>
      {/* 스크롤해도 닫기 버튼이 보이게 — 높이 0 인 sticky 줄에 버튼을 띄운다 */}
      <div className="sticky top-0 z-10 flex h-0 justify-end">
        <button
          type="button"
          aria-label="닫기"
          onClick={onRequestClose}
          className="m-3 flex size-11 items-center justify-center rounded-full bg-surface/90 shadow-md hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <CloseIcon />
        </button>
      </div>

      {/* 목록 카드 썸네일에서 이 자리로 커지는 전환의 도착점 (PRD 3-3-D) */}
      <div
        className="relative aspect-video bg-surface-muted"
        style={{ viewTransitionName: PROJECT_THUMB_TRANSITION_NAME }}
      >
        <SafeImage
          src={thumbnailUrl}
          fallbackSrc={DEFAULT_PROJECT_IMAGE}
          alt=""
          fill
          sizes="(min-width: 768px) 56rem, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-8 p-6 md:p-8">
        <header className="flex flex-col gap-3">
          <Badge tone={PROJECT_CATEGORY_TONES[category]} className="self-start">
            {PROJECT_CATEGORY_LABELS[category]}
          </Badge>
          <h2 id={titleId} className="text-2xl font-bold tracking-tight break-keep md:text-3xl">
            {title}
          </h2>
          <p className="break-keep text-ink-muted">{summary}</p>
          {/* 기본 정보: 기간 · 상태 */}
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-muted">기간</dt>
              <dd className="tabular-nums">{formatMonthPeriod(period)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-muted">상태</dt>
              <dd>{PROJECT_STATUS_LABELS[status]}</dd>
            </div>
          </dl>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="flex flex-col gap-8">
            <DetailSection title="프로젝트 소개">
              <div className="flex flex-col gap-3 leading-relaxed break-keep">
                {description.map((paragraph, index) => (
                  // 같은 문장이 반복될 수 있고 순서만 바뀌는 일이 없어 인덱스를 key 로 쓴다
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </DetailSection>
            {features.length > 0 && (
              <DetailSection title="주요 기능">
                <BulletList items={features} />
              </DetailSection>
            )}
            {outcomes.length > 0 && (
              <DetailSection title={PROJECT_OUTCOMES_TITLES[status]}>
                <BulletList items={outcomes} />
              </DetailSection>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {team.length > 0 && (
              <DetailSection title="팀">
                {/* 입력 순서 그대로 (API 3-1) */}
                <ul className="flex flex-col gap-2 text-sm">
                  {team.map((member, index) => (
                    <li key={`${member.name}-${index}`} className="flex justify-between gap-4">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-right text-ink-muted">{member.role}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {techStack.length > 0 && (
              <DetailSection title="기술 스택">
                <ul className="flex flex-wrap gap-1.5">
                  {techStack.map((tech) => (
                    <li key={tech} className="max-w-full">
                      <Tag>#{tech}</Tag>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {/* 없는 링크는 버튼을 두지 않는다 */}
            {hasLinks && (
              <div className="flex flex-wrap gap-2">
                {links.github && (
                  <ExternalButton href={links.github} variant="primary">
                    GitHub
                  </ExternalButton>
                )}
                {links.demo && (
                  <ExternalButton href={links.demo} variant="secondary">
                    데모
                  </ExternalButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 break-keep marker:text-brand-blue">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

interface ExternalButtonProps {
  href: string;
  variant: "primary" | "secondary";
  children: ReactNode;
}

/** 외부 링크는 새 탭 (IA 3-4) */
function ExternalButton({ href, variant, children }: ExternalButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonStyles({ variant, className: "flex-1" })}
    >
      {children}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(새 탭)</span>
    </a>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
