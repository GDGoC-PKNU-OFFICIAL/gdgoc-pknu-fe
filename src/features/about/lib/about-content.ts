// src/features/about/lib/about-content.ts
// About 내용(API · 관리자 폼 모양) ↔ 화면 컴포넌트가 쓰는 모양.
//
// - DEFAULT_ABOUT: 관리자가 한 번도 저장하지 않았을 때(GET /api/about 404) 보여 줄 내용.
//   코드에 들어 있던 data/about · rules · faq 를 그대로 옮긴 것이라 첫 저장 전후로 화면이 같다.
// - toPosterActivity · toRuleDoc: API 모양 → ActivityPoster · 규칙 상세가 그리는 모양.

import {
  ABOUT_ACTIVITY_GROUPS as DATA_GROUPS,
  ACTIVITIES,
  type Activity,
  IDENTITY,
} from "@/data/about";
import { FAQ } from "@/data/faq";
import { RULES, type RuleDoc } from "@/data/rules";
import type {
  AboutActivityGroup,
  AboutActivityItem,
  AboutActivityTone,
  AboutContent,
} from "@/types/api";

import { parseRuleMarkdown, ruleToMarkdown } from "./rule-markdown";

/** 카드 제목 위 작은 글씨 */
export const ACTIVITY_GROUP_LABELS = {
  activity: "GDGoC PKNU 활동",
  "free-content": "무료 학습 콘텐츠",
} satisfies Record<AboutActivityGroup, string>;

/**
 * 카드 바탕 (Tailwind 가 찾을 수 있게 클래스를 통째로). auto 는 ActivityPoster 의 순서대로 돌아가는 기본 색.
 * 앞의 일곱은 기본 색과 같은 밝은 그라데이션, forest · plum 은 사진 · 로고와 어울리는 탁한 세로 그라데이션.
 */
const TONE_BACKGROUNDS = {
  auto: undefined,
  blue: "bg-gradient-to-br from-[#5b8def] to-[#2a56c6]",
  green: "bg-gradient-to-br from-[#43b968] to-[#1e8e3e]",
  coral: "bg-gradient-to-br from-[#f2756a] to-[#e0457b]",
  orange: "bg-gradient-to-br from-[#f6b53d] to-[#e37400]",
  navy: "bg-gradient-to-br from-[#3d5a99] to-[#1b2a5e]",
  gray: "bg-gradient-to-br from-[#80868b] to-[#3c4043]",
  purple: "bg-gradient-to-br from-[#a35ef0] to-[#6a1fb5]",
  forest: "bg-gradient-to-b from-[#24392d] via-[#33503f] to-[#4d7560]",
  plum: "bg-gradient-to-b from-[#2d2738] via-[#41385a] to-[#63587e]",
} satisfies Record<AboutActivityTone, string | undefined>;

/** 관리자 폼 색 고르기 이름 · 견본 */
export const TONE_LABELS = {
  auto: "자동 (순서대로)",
  blue: "파랑",
  green: "초록",
  coral: "코랄",
  orange: "주황",
  navy: "남색",
  gray: "회색",
  purple: "보라",
  forest: "숲 (어두운 초록)",
  plum: "자두 (어두운 보라)",
} satisfies Record<AboutActivityTone, string>;

export function toneBackground(tone: AboutActivityTone): string | undefined {
  return TONE_BACKGROUNDS[tone];
}

/** API 카드 → ActivityPoster 가 그리는 모양 */
export function toPosterActivity(item: AboutActivityItem): Activity {
  const base: Activity = {
    title: item.title,
    cadence: item.cadence,
    description: item.description,
    background: TONE_BACKGROUNDS[item.tone],
  };
  const image = item.imageUrl;
  switch (item.layout) {
    case "cover":
    case "square":
    case "top":
      return image
        ? { ...base, photo: image, photoLayout: item.layout, photoPosition: item.imagePosition }
        : base;
    case "artwork":
      return image ? { ...base, artwork: image } : base;
    case "logo":
      return { ...base, logo: true };
    case "circles":
      return image && item.secondImageUrl
        ? { ...base, circles: [image, item.secondImageUrl] as const }
        : image
          ? { ...base, photo: image, photoLayout: "square" }
          : base;
    default:
      return base;
  }
}

/** API 규칙 → 블록 · 상세 카드가 그리는 모양 */
export function toRuleDoc(item: AboutContent["rules"][number]): RuleDoc {
  return { slug: item.slug, title: item.title, icon: item.icon, ...parseRuleMarkdown(item.body) };
}

// ───────────────────────────── 기본 내용 ─────────────────────────────

function toneOf(activity: Activity): AboutActivityTone {
  const entry = Object.entries(TONE_BACKGROUNDS).find(([, value]) => value === activity.background);
  return (entry?.[0] as AboutActivityTone | undefined) ?? "auto";
}

function fromStaticActivity(activity: Activity, group: AboutActivityGroup): AboutActivityItem {
  const common = {
    group,
    title: activity.title,
    cadence: activity.cadence,
    description: activity.description,
    tone: toneOf(activity),
  };
  if (activity.photo) {
    return {
      ...common,
      layout: activity.photoLayout ?? "cover",
      imageUrl: activity.photo,
      imagePosition: activity.photoPosition,
    };
  }
  if (activity.circles) {
    return {
      ...common,
      layout: "circles",
      imageUrl: activity.circles[0],
      secondImageUrl: activity.circles[1],
    };
  }
  if (activity.artwork) return { ...common, layout: "artwork", imageUrl: activity.artwork };
  if (activity.logo) return { ...common, layout: "logo" };
  return { ...common, layout: "color" };
}

const GROUP_CODES = ["activity", "free-content"] as const satisfies readonly AboutActivityGroup[];

export const DEFAULT_ABOUT: AboutContent = {
  identity: [...IDENTITY.paragraphs],
  activities: DATA_GROUPS.flatMap(({ titles }, groupIndex) =>
    titles.flatMap((title) =>
      ACTIVITIES.items
        .filter((item) => item.title === title)
        .map((item) => fromStaticActivity(item, GROUP_CODES[groupIndex])),
    ),
  ),
  rules: RULES.items.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    icon: doc.icon,
    body: ruleToMarkdown(doc),
  })),
  faq: FAQ.items.map(({ question, answer }) => ({ question, answer })),
};
