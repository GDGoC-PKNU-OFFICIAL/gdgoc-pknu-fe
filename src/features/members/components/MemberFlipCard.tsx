"use client";

import { type FocusEvent, type MouseEvent, type ReactNode, useRef, useState } from "react";

import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Tag from "@/components/ui/Tag";
import { MEMBER_PART_LABELS } from "@/constants/labels";
import { type AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { Member } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE } from "../lib/member-labels";

/** 카드를 뒤집는 조건: 마우스를 올림 · 키보드 포커스 · 터치로 뒤집어 둠 */
const ROTATE = cn(
  "motion-safe:group-hover:rotate-y-180 motion-safe:group-focus-visible:rotate-y-180",
  // 뒷면의 GitHub · 메일 링크에 Tab 으로 들어와도 뒤집힌 채로 둔다
  "motion-safe:group-has-[a:focus-visible]:rotate-y-180",
  "motion-safe:group-data-[flipped=true]:rotate-y-180",
);

/** "모션 줄이기": 회전 대신 앞면이 사라지고 뒷면이 나타난다 */
const FADE_OUT = cn(
  "motion-reduce:group-hover:opacity-0 motion-reduce:group-focus-visible:opacity-0",
  "motion-reduce:group-has-[a:focus-visible]:opacity-0",
  "motion-reduce:group-data-[flipped=true]:opacity-0",
);
const FADE_IN = cn(
  "motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100",
  "motion-reduce:group-focus-visible:opacity-100",
  "motion-reduce:group-has-[a:focus-visible]:opacity-100",
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
  // 높이를 고정하지 않고 비율(4 : 5)로 맞춘다 — 슬라이드 · 관리자 미리보기 어디서든 카드 모양이 같고, 넓은 칸에서 아래가 비지 않는다
  "group block aspect-[4/5] w-full rounded-2xl perspective-distant",
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
  /** GA4 member_card_flip 의 section (IA 10-5). 없으면 보내지 않는다 (관리자 미리보기 등) */
  analyticsSection?: AnalyticsEvents["member_card_flip"]["section"];
}

/**
 * 멤버 플립 카드 (C-05). 홈 · Members 가 같은 카드를 쓴다.
 *
 * 마우스를 올리면 뒤집힌다. 홈에서는 카드 전체가 Members 페이지로 가는 링크 하나다. 마우스가 없는 환경도 쓸 수 있어야 한다:
 * - 키보드: Tab 으로 포커스가 오면 뒤집히고 Enter 로 이동한다
 * - 터치: 첫 탭으로 뒤집고, 뒤집힌 카드를 다시 탭하면 이동한다 (링크가 없으면 탭할 때마다 뒤집는다)
 * 앞/뒤 상태는 URL 에 남기지 않는다 (IA 6-2). 슬라이드 트랙에서 스와이프하면 브라우저가 click 을 내지 않아 뒤집히지 않는다.
 */
export default function MemberFlipCard({
  member,
  href,
  previewFace,
  analyticsSection,
}: MemberFlipCardProps) {
  const { name, department, history, interests, part, bio, photoUrl, links } = member;
  // 카드 전체가 링크(href)면 안에 다른 링크를 둘 수 없어 아이콘을 빼고, 미리보기는 누를 수 없어 모양만 보여 준다
  const showLinks = !href && Boolean(links?.github || links?.email);
  /** 터치에서만 쓴다. 마우스 · 키보드는 CSS 로 뒤집는다 */
  const [flipped, setFlipped] = useState(false);
  /** 같은 카드는 화면에 있는 동안 한 번만 센다 — hover 로 뒤집힐 때마다 이벤트가 쏟아지지 않게 */
  const trackedRef = useRef(false);

  /** 후면이 보이게 된 순간 (hover · 키보드 포커스 · 터치) — GA4 member_card_flip */
  function trackFlip() {
    if (!analyticsSection || trackedRef.current) return;
    trackedRef.current = true;
    trackEvent("member_card_flip", { section: analyticsSection, member_id: member.id });
  }

  function handleClick(event: MouseEvent) {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (!href) {
      if (!flipped) trackFlip();
      setFlipped((value) => !value);
    } else if (!flipped) {
      event.preventDefault();
      trackFlip();
      setFlipped(true);
    }
  }

  /** 마우스 · 키보드는 CSS 로 뒤집히므로 같은 조건(hover · focus-visible)에서 센다 */
  const flipTriggers = {
    onMouseEnter: trackFlip,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(":focus-visible")) trackFlip();
    },
  };

  const preview = previewFace !== undefined;

  // 링크 안에 들어가므로 블록 요소 없이 span 으로만 구성한다
  const faces = (
    <span
      className={cn(
        // 천천히 출발해 천천히 멈추는 곡선(ease-in-out)으로 0.5초 동안 돈다. will-change 로 회전을 GPU 레이어에서 그려 끊김을 줄인다.
        // 마우스를 올릴 때만 0.1초 늦게 출발한다 — 커서가 카드 위를 스쳐 지나갈 때 카드가 덜컥 뒤집혔다 돌아오지 않게 (내릴 때는 바로)
        "relative block h-full transition-transform duration-500 ease-[cubic-bezier(0.45,0,0.2,1)] will-change-transform transform-3d",
        "motion-safe:group-hover:delay-100",
        "motion-reduce:transition-none",
        preview ? PREVIEW_ROTATE : ROTATE,
      )}
    >
      {/* 전면 */}
      <span
        className={cn(
          FACE,
          "items-center justify-center gap-3 bg-surface p-5",
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
            <span className="flex max-w-full flex-wrap justify-center gap-1.5">
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
        <span className="flex max-w-full min-w-0 flex-col gap-1">
          <span className="text-xs text-ink-muted">한 줄 소개</span>
          {/* 띄어쓰기 없는 긴 글도 카드 밖으로 나가지 않게 아무 데서나 줄을 바꾼다 */}
          <span className="line-clamp-5 text-sm leading-relaxed [overflow-wrap:anywhere] break-keep">
            {bio}
          </span>
        </span>
        {showLinks && (
          <span className="flex items-center gap-2">
            {links.github && (
              <ContactLink
                href={links.github}
                label={`${name} GitHub (새 탭)`}
                external
                disabled={preview}
                icon={GITHUB_ICON}
              />
            )}
            {links.email && (
              <ContactLink
                href={`mailto:${links.email}`}
                label={`${name}에게 메일 보내기 (${links.email})`}
                disabled={preview}
                icon={MAIL_ICON}
              />
            )}
          </span>
        )}
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
      <div
        tabIndex={0}
        data-flipped={flipped}
        onClick={handleClick}
        {...flipTriggers}
        className={CARD}
      >
        {faces}
      </div>
    );
  }

  return (
    <Link
      href={href}
      data-flipped={flipped}
      onClick={handleClick}
      {...flipTriggers}
      className={CARD}
    >
      {faces}
    </Link>
  );
}

const GITHUB_ICON = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

const MAIL_ICON = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

/** 뒷면의 GitHub · 메일 아이콘 버튼. 누르면 카드가 다시 뒤집히지 않도록 click 을 카드까지 올리지 않는다 */
function ContactLink({
  href,
  label,
  icon,
  external,
  disabled,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  disabled?: boolean;
}) {
  const className =
    "flex size-11 items-center justify-center rounded-full bg-surface text-ink shadow-sm transition-colors hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";
  if (disabled) {
    return (
      <span aria-hidden="true" className={className}>
        {icon}
      </span>
    );
  }
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      onClick={(event) => event.stopPropagation()}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {icon}
    </a>
  );
}
