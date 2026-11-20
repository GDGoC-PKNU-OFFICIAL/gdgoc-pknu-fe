"use client";

import { Fragment, type ReactNode, type Ref, useId } from "react";

import type { RuleDoc, RuleItem, RuleSection } from "@/data/rules";

import { RuleIconTile } from "./RuleDocBlock";

interface RuleDetailOverlayProps {
  ref: Ref<HTMLDialogElement>;
  /** null 이면 빈 <dialog> 만 둔다 (열고 닫기는 RuleDetailController 가 한다) */
  doc: RuleDoc | null;
  onRequestClose: () => void;
  onClose: () => void;
}

/**
 * 활동 규칙 상세 카드. 스터디 상세(StudyDetailOverlay)와 같은 틀 —
 * 네이티브 <dialog>.showModal(), 모바일 전체 화면 · 태블릿 이상 가운데 모달.
 */
export default function RuleDetailOverlay({
  ref,
  doc,
  onRequestClose,
  onClose,
}: RuleDetailOverlayProps) {
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-surface p-0 text-ink backdrop:bg-ink/60 md:m-auto md:h-auto md:max-h-[90dvh] md:w-[min(44rem,calc(100vw-4rem))] md:rounded-2xl md:shadow-xl"
    >
      {doc && <RuleDetailContent doc={doc} titleId={titleId} onRequestClose={onRequestClose} />}
    </dialog>
  );
}

function RuleDetailContent({
  doc,
  titleId,
  onRequestClose,
}: {
  doc: RuleDoc;
  titleId: string;
  onRequestClose: () => void;
}) {
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
        <header className="flex items-center gap-4 pr-10">
          <RuleIconTile icon={doc.icon} />
          <h2 id={titleId} className="text-2xl font-bold tracking-tight break-keep md:text-3xl">
            {doc.title}
          </h2>
        </header>

        {doc.intro && (
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm leading-relaxed break-keep md:text-base">
            <RichText text={doc.intro} />
          </p>
        )}

        {doc.sections.map((section) => (
          <RuleSectionView key={section.heading} section={section} />
        ))}
        {doc.note && <RuleNote note={doc.note} />}
      </div>
    </>
  );
}

function RuleSectionView({ section }: { section: RuleSection }) {
  const List = section.ordered ? "ol" : "ul";
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-bold break-keep">{section.heading}</h3>
      {section.lead && (
        <p className="leading-relaxed break-keep text-ink-muted">
          <RichText text={section.lead} />
        </p>
      )}
      {section.items && (
        <List
          className={
            section.ordered
              ? "flex list-decimal flex-col gap-2 pl-5 leading-relaxed break-keep marker:font-semibold marker:text-brand-blue"
              : "flex list-disc flex-col gap-2 pl-5 leading-relaxed break-keep marker:text-brand-blue"
          }
        >
          {section.items.map((item) => (
            <RuleListItem key={typeof item === "string" ? item : item.text} item={item} />
          ))}
        </List>
      )}
      {section.after && <p className="leading-relaxed break-keep">{section.after}</p>}
    </section>
  );
}

function RuleNote({ note }: { note: string }) {
  // 기울임 대신: 왼쪽 경고 아이콘 + 핵심 문구(**…**)만 빨간 굵은 글씨
  return (
    <p className="flex items-start gap-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm leading-relaxed break-keep md:text-base">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mt-0.5 size-5 shrink-0 text-brand-red"
        fill="currentColor"
      >
        <path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" />
      </svg>
      <span>
        <RichText text={note} strongClassName="font-bold text-brand-red" />
      </span>
    </p>
  );
}

function RuleListItem({ item }: { item: RuleItem }) {
  if (typeof item === "string") {
    return (
      <li>
        <RichText text={item} />
      </li>
    );
  }
  return (
    <li>
      <RichText text={item.text} />
      <ul className="mt-2 flex list-[circle] flex-col gap-2 pl-5">
        {item.sub.map((sub) => (
          <li key={sub}>
            <RichText text={sub} />
          </li>
        ))}
      </ul>
    </li>
  );
}

/** "**굵게**" 표시만 굵은 글씨로 바꾼다 */
function RichText({
  text,
  strongClassName = "font-semibold text-ink",
}: {
  text: string;
  strongClassName?: string;
}): ReactNode {
  return text.split("**").map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className={strongClassName}>
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
