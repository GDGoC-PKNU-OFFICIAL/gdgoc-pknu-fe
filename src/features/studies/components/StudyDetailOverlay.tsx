"use client";

import { type ReactNode, type Ref, useId } from "react";

import Badge from "@/components/ui/Badge";
import { formatMonthPeriod } from "@/lib/date";
import type { Study } from "@/types/api";

import { STUDY_STATUS_LABELS } from "../lib/study-labels";

interface StudyDetailOverlayProps {
  ref: Ref<HTMLDialogElement>;
  /** null 이면 빈 <dialog> 만 둔다 (열고 닫기는 StudyDetailController 가 showModal · close 로 한다) */
  study: Study | null;
  /** 닫기 버튼 · ESC · 바깥 클릭 — URL 처리까지 컨트롤러에 맡긴다 */
  onRequestClose: () => void;
  /** <dialog> 가 실제로 닫힌 뒤 (어떤 경로로 닫혔든) */
  onClose: () => void;
}

/**
 * 스터디 상세 카드. 프로젝트 상세(ProjectDetailOverlay)와 같은 틀 —
 * 네이티브 <dialog>.showModal() 로 포커스 가두기 · 뒤 페이지 inert 를 브라우저에 맡긴다.
 * 모바일 전체 화면, 태블릿 이상 가운데 모달. 목록 응답에 내용이 다 있어 추가 fetch 가 없다.
 */
export default function StudyDetailOverlay({
  ref,
  study,
  onRequestClose,
  onClose,
}: StudyDetailOverlayProps) {
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // ESC: 브라우저가 바로 닫지 않게 막고, 닫기 버튼과 같은 경로(URL 처리)로 닫는다
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClose={onClose}
      // 바깥(::backdrop) 클릭은 target 이 <dialog> 자신이다
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-surface p-0 text-ink backdrop:bg-ink/60 md:m-auto md:h-auto md:max-h-[90dvh] md:w-[min(40rem,calc(100vw-4rem))] md:rounded-2xl md:shadow-xl"
    >
      {study && (
        <StudyDetailContent study={study} titleId={titleId} onRequestClose={onRequestClose} />
      )}
    </dialog>
  );
}

interface StudyDetailContentProps {
  study: Study;
  titleId: string;
  onRequestClose: () => void;
}

function StudyDetailContent({ study, titleId, onRequestClose }: StudyDetailContentProps) {
  const { topic, title, summary, status, period, leader, participants, format, outputs } = study;

  return (
    <>
      {/* 스크롤해도 닫기 버튼이 보이게 — 높이 0 인 sticky 줄에 버튼을 띄운다 */}
      <div className="sticky top-0 z-10 flex h-0 justify-end">
        <button
          type="button"
          aria-label="닫기"
          onClick={onRequestClose}
          className="m-3 flex size-11 items-center justify-center rounded-full bg-surface/90 transition-shadow hover:bg-surface hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
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
        </button>
      </div>

      <div className="flex flex-col gap-8 p-6 pt-16 md:p-8 md:pt-10">
        <header className="flex min-w-0 flex-col gap-3 pr-10">
          <Badge tone="green" className="self-start [overflow-wrap:anywhere]">
            {topic}
          </Badge>
          <h2
            id={titleId}
            className="text-2xl font-bold tracking-tight [overflow-wrap:anywhere] break-keep md:text-3xl"
          >
            {title}
          </h2>
          <p className="[overflow-wrap:anywhere] break-keep text-ink-muted">{summary}</p>
        </header>

        <DetailSection title="스터디 정보">
          <dl className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt className="text-ink-muted">기간</dt>
            <dd className="tabular-nums">{formatMonthPeriod(period)}</dd>
            <dt className="text-ink-muted">상태</dt>
            <dd>{STUDY_STATUS_LABELS[status]}</dd>
            <dt className="text-ink-muted">리더</dt>
            <dd className="[overflow-wrap:anywhere]">{leader}</dd>
            <dt className="text-ink-muted">인원</dt>
            <dd>{1 + participants.length}명</dd>
            <dt className="text-ink-muted">방식</dt>
            <dd className="[overflow-wrap:anywhere]">{format ?? "–"}</dd>
          </dl>
        </DetailSection>

        {participants.length > 0 && (
          <DetailSection title="참여자">
            {/* 입력 순서 그대로. 리더는 위 정보에 있다 */}
            <ul className="flex flex-wrap gap-1.5">
              {participants.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  className="max-w-full rounded-full bg-surface-muted px-3 py-1 text-sm [overflow-wrap:anywhere]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {outputs.length > 0 && (
          <DetailSection title="결과물">
            <ul className="flex flex-col gap-2">
              {outputs.map(({ label, url }) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-brand-blue hover:text-brand-blue"
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">(새 탭)</span>
                  </a>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
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
