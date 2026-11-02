"use client";

import { useEffect, useId, useRef, useState } from "react";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import { MEMBER_PART_LABELS, MEMBER_ROLE_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { Member } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE, MEMBER_ROLE_TONES } from "../lib/member-labels";

/** 두 면에 공통. 보이지 않는 면은 뒤로 돌아가 있고, "모션 줄이기"에서는 회전 대신 투명도로 바뀐다 */
const FACE = cn(
  "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface backface-hidden",
  "motion-reduce:transition-opacity motion-reduce:duration-200",
);

interface MemberFlipCardProps {
  member: Member;
}

/**
 * 멤버 플립 카드 (C-05, IA 5-5 · PRD 3-3-C).
 *
 * 카드 전체를 button 으로 만들지 않는다 — 후면 링크가 버튼 안에 들어가면 인터랙티브 요소 중첩이 된다.
 * 전면은 면 전체를 덮는 뒤집기 버튼이고, 후면은 링크와 "앞면으로" 버튼이 형제로 놓인다.
 * 보이지 않는 면은 inert 로 Tab 순서 · 스크린리더에서 뺀다. 뒤집은 뒤에는 새로 보이는 면의 첫 버튼으로 포커스를 옮긴다.
 *
 * 앞/뒤 상태는 URL 에 남기지 않는다 (IA 6-2). 슬라이드 트랙에서 스와이프하면 브라우저가 click 을 내지 않아 뒤집히지 않는다.
 */
export default function MemberFlipCard({ member }: MemberFlipCardProps) {
  const { name, department, history, interests, part, bio, links, photoUrl } = member;
  const [flipped, setFlipped] = useState(false);
  const detailsId = useId();

  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  /** 첫 렌더에서는 포커스를 옮기지 않는다 */
  const flippedByUser = useRef(false);

  useEffect(() => {
    if (!flippedByUser.current) return;
    (flipped ? backButton : frontButton).current?.focus();
  }, [flipped]);

  function flip(next: boolean) {
    flippedByUser.current = true;
    setFlipped(next);
  }

  return (
    <div className="h-[24rem] perspective-distant">
      <div
        className={cn(
          "relative h-full transition-transform duration-500 transform-3d",
          "motion-reduce:transform-none motion-reduce:transition-none",
          flipped && "rotate-y-180",
        )}
      >
        {/* 전면 */}
        <div inert={flipped} className={cn(FACE, flipped && "motion-reduce:opacity-0")}>
          <button
            ref={frontButton}
            type="button"
            aria-label={`${name} 카드 뒷면 보기`}
            aria-describedby={detailsId}
            onClick={() => flip(true)}
            className="relative flex h-full w-full cursor-pointer flex-col items-center gap-3 p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue"
          >
            <span className="relative size-32 shrink-0 overflow-hidden rounded-2xl bg-surface-muted">
              {/* 이름이 바로 아래 있으므로 장식 이미지로 둔다 */}
              <SafeImage
                src={photoUrl}
                fallbackSrc={DEFAULT_MEMBER_IMAGE}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </span>

            <span className="flex w-full min-w-0 flex-col gap-2">
              <span className="flex min-w-0 items-center justify-center gap-2">
                <span className="truncate text-lg font-semibold">{name}</span>
                {member.status === "core" && (
                  <Badge tone={MEMBER_ROLE_TONES[member.role]} className="shrink-0">
                    {MEMBER_ROLE_LABELS[member.role]}
                  </Badge>
                )}
              </span>
              <span id={detailsId} className="flex min-w-0 flex-col gap-2">
                <span className="truncate text-center text-sm text-ink-muted">{department}</span>
                {history.length > 0 && (
                  <span className="flex flex-col gap-0.5 text-center text-sm">
                    {history.map((item) => (
                      <span key={item} className="truncate">
                        · {item}
                      </span>
                    ))}
                  </span>
                )}
                {interests.length > 0 && (
                  <span className="flex flex-wrap justify-center gap-1.5">
                    {interests.map((interest) => (
                      <Tag key={interest}>#{interest}</Tag>
                    ))}
                  </span>
                )}
              </span>
            </span>

            <FlipHint className="absolute right-4 bottom-4" />
          </button>
        </div>

        {/* 후면 */}
        <div
          inert={!flipped}
          className={cn(
            FACE,
            "rotate-y-180 gap-4 p-5 motion-reduce:transform-none",
            !flipped && "motion-reduce:opacity-0",
          )}
        >
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-ink-muted">분야</dt>
              <dd className="font-semibold">{MEMBER_PART_LABELS[part]}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-ink-muted">한 줄 소개</dt>
              <dd className="text-sm leading-relaxed break-keep">{bio}</dd>
            </div>
          </dl>

          <div className="mt-auto flex flex-col gap-2">
            {links.github && <ExternalLink href={links.github} label="GitHub" />}
            {links.homepage && <ExternalLink href={links.homepage} label="소개 페이지" />}
            <button
              ref={backButton}
              type="button"
              aria-label={`${name} 카드 앞면 보기`}
              onClick={() => flip(false)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm text-ink-muted transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-blue"
            >
              <FlipHint />
              앞면으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-line text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand-blue"
    >
      {label} <span aria-hidden="true">↗</span>
      <span className="sr-only">(새 탭)</span>
    </a>
  );
}

/** 뒤집을 수 있다는 힌트 아이콘 ↻ */
function FlipHint({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-4 text-ink-muted", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />
    </svg>
  );
}
