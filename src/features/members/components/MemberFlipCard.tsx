"use client";

import { type MouseEvent, useState } from "react";

import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import Tag from "@/components/ui/Tag";
import { MEMBER_PART_LABELS, MEMBER_ROLE_LABELS } from "@/constants/labels";
import { cn } from "@/lib/cn";
import type { Member } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE, MEMBER_ROLE_TONES } from "../lib/member-labels";

/** 카드를 뒤집는 조건: 마우스를 올림 · 키보드 포커스 · 터치로 뒤집어 둠 */
const ROTATE = cn(
  "motion-safe:group-hover:rotate-y-180 motion-safe:group-focus-visible:rotate-y-180",
  "motion-safe:group-data-[flipped=true]:rotate-y-180",
);

/** "모션 줄이기": 회전 대신 앞면이 사라지고 뒷면이 나타난다 */
const FADE_OUT = cn(
  "motion-reduce:group-hover:opacity-0 motion-reduce:group-focus-visible:opacity-0",
  "motion-reduce:group-data-[flipped=true]:opacity-0",
);
const FADE_IN = cn(
  "motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100",
  "motion-reduce:group-focus-visible:opacity-100",
  "motion-reduce:group-data-[flipped=true]:opacity-100",
);

/** 미리보기(관리자 폼): 마우스 · 포커스로는 뒤집지 않고 [전면] · [후면] 버튼으로만 뒤집는다 */
const PREVIEW_ROTATE = "motion-safe:group-data-[flipped=true]:rotate-y-180";
const PREVIEW_FADE_OUT = "motion-reduce:group-data-[flipped=true]:opacity-0";
const PREVIEW_FADE_IN =
  "motion-reduce:opacity-0 motion-reduce:group-data-[flipped=true]:opacity-100";

const FACE = cn(
  "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line backface-hidden",
  "motion-reduce:transition-opacity motion-reduce:duration-200",
);

const CARD = cn(
  "group block h-[24rem] rounded-2xl perspective-distant",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
);

interface MemberFlipCardProps {
  member: Member;
  /** 카드를 눌렀을 때 갈 경로. 홈은 Members 페이지이고, Members 페이지 안에서는 없다 */
  href?: string;
  /**
   * 관리자 폼 미리보기(A-42 · A-43)에서 보여 줄 면. 주면 카드가 상호작용 없이 이 면만 보여 준다
   * (링크 · 포커스 · hover 뒤집기 없음). 내용은 바로 옆 입력 폼과 같으므로 스크린 리더에서는 숨긴다.
   */
  previewFace?: "front" | "back";
}

/**
 * 멤버 플립 카드 (C-05). 홈 · Members 가 같은 카드를 쓴다.
 *
 * 마우스를 올리면 뒤집힌다. 홈에서는 카드 전체가 Members 페이지로 가는 링크 하나다. 마우스가 없는 환경도 쓸 수 있어야 한다:
 * - 키보드: Tab 으로 포커스가 오면 뒤집히고 Enter 로 이동한다
 * - 터치: 첫 탭으로 뒤집고, 뒤집힌 카드를 다시 탭하면 이동한다 (링크가 없으면 탭할 때마다 뒤집는다)
 * 앞/뒤 상태는 URL 에 남기지 않는다 (IA 6-2). 슬라이드 트랙에서 스와이프하면 브라우저가 click 을 내지 않아 뒤집히지 않는다.
 */
export default function MemberFlipCard({ member, href, previewFace }: MemberFlipCardProps) {
  const { name, department, history, interests, part, bio, photoUrl } = member;
  /** 터치에서만 쓴다. 마우스 · 키보드는 CSS 로 뒤집는다 */
  const [flipped, setFlipped] = useState(false);

  function handleClick(event: MouseEvent) {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (!href) {
      setFlipped((value) => !value);
    } else if (!flipped) {
      event.preventDefault();
      setFlipped(true);
    }
  }

  const preview = previewFace !== undefined;

  // 링크 안에 들어가므로 블록 요소 없이 span 으로만 구성한다
  const faces = (
    <span
      className={cn(
        "relative block h-full transition-transform duration-500 transform-3d",
        "motion-reduce:transition-none",
        preview ? PREVIEW_ROTATE : ROTATE,
      )}
    >
      {/* 전면 */}
      <span
        className={cn(
          FACE,
          "items-center gap-3 bg-surface p-5",
          preview ? PREVIEW_FADE_OUT : FADE_OUT,
        )}
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

        <span className="flex w-full min-w-0 flex-col gap-2 text-center">
          <span className="flex min-w-0 items-center justify-center gap-2">
            <span className="truncate text-lg font-semibold">{name}</span>
            {member.status === "core" && (
              <Badge tone={MEMBER_ROLE_TONES[member.role]} className="shrink-0">
                {MEMBER_ROLE_LABELS[member.role]}
              </Badge>
            )}
          </span>
          <span className="truncate text-sm text-ink-muted">{department}</span>
          {history.length > 0 && (
            <span className="flex flex-col gap-0.5 text-sm">
              {history.map((item) => (
                <span key={item} className="truncate">
                  {item}
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

      {/* 후면 */}
      <span
        className={cn(
          FACE,
          "items-center justify-center gap-5 bg-surface-muted p-6 text-center motion-safe:rotate-y-180",
          preview ? PREVIEW_FADE_IN : FADE_IN,
        )}
      >
        <span className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">분야</span>
          {/* 관리자 미리보기에서는 분야를 아직 고르지 않았을 수 있다 */}
          <span className="text-lg font-semibold">{MEMBER_PART_LABELS[part] ?? "—"}</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">한 줄 소개</span>
          <span className="text-sm leading-relaxed break-keep">{bio}</span>
        </span>
      </span>
    </span>
  );

  if (preview) {
    return (
      <div aria-hidden="true" data-flipped={previewFace === "back"} className={CARD}>
        {faces}
      </div>
    );
  }

  if (!href) {
    return (
      <div tabIndex={0} data-flipped={flipped} onClick={handleClick} className={CARD}>
        {faces}
      </div>
    );
  }

  return (
    <Link href={href} data-flipped={flipped} onClick={handleClick} className={CARD}>
      {faces}
    </Link>
  );
}
