// src/components/admin/lib/preview-values.ts
// 입력 중인 폼 값(빈 칸 · 고르는 중 포함) → 공개 카드에 넣을 수 있는 응답 모양.
// 비어 있는 필수 칸은 자리 표시 글자로 채워, 처음 등록할 때도 카드 모양이 그대로 보이게 한다.

import { currentYearMonthKst, isIsoDate, isYearMonth, todayKst } from "@/lib/date";
import {
  BADGE_COLORS,
  type BadgeColor,
  EVENT_CATEGORIES,
  type EventCategory,
  type EventItem,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
  type Study,
} from "@/types/api";

const NOW = "2026-01-01T00:00:00+09:00";

function oneOf<T extends string>(values: readonly T[], value: unknown, fallback: T): T {
  return (values as readonly string[]).includes(value as string) ? (value as T) : fallback;
}

function text(value: unknown, placeholder: string): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : placeholder;
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "")
    : [];
}

function yearMonth(value: unknown): string {
  return typeof value === "string" && isYearMonth(value) ? value : currentYearMonthKst();
}

function optionalYearMonth(value: unknown): string | undefined {
  return typeof value === "string" && isYearMonth(value) ? value : undefined;
}

/** 입력 중인 프로젝트 폼 값 → 카드 미리보기 */
export function previewProject(values: Record<string, unknown>): Project {
  const period = (values.period ?? {}) as Record<string, unknown>;
  const badge = (values.badge ?? {}) as Record<string, unknown>;
  const badgeLabel = typeof badge.label === "string" ? badge.label.trim() : "";
  const end = optionalYearMonth(period.end);
  return {
    id: 0,
    slug: text(values.slug, "preview"),
    title: text(values.title, "프로젝트 제목"),
    summary: text(values.summary, "한 줄 요약이 여기에 보입니다."),
    description: list(values.description),
    category: oneOf<ProjectCategory>(PROJECT_CATEGORIES, values.category, "team-project"),
    badge: badgeLabel
      ? { label: badgeLabel, color: oneOf<BadgeColor>(BADGE_COLORS, badge.color, "blue") }
      : undefined,
    status: end && end < currentYearMonthKst() ? "past" : "current",
    period: { start: yearMonth(period.start), end },
    team: [],
    techStack: list(values.techStack),
    features: list(values.features),
    outcomes: list(values.outcomes),
    thumbnailUrl: typeof values.thumbnailUrl === "string" ? values.thumbnailUrl : undefined,
    links: {},
    createdAt: NOW,
    updatedAt: NOW,
  } as Project;
}

/** 입력 중인 스터디 폼 값 → 카드 미리보기 */
export function previewStudy(values: Record<string, unknown>): Study {
  const period = (values.period ?? {}) as Record<string, unknown>;
  const end = optionalYearMonth(period.end);
  const format = typeof values.format === "string" ? values.format.trim() : "";
  return {
    id: 0,
    slug: text(values.slug, "preview"),
    title: text(values.title, "스터디 제목"),
    summary: text(values.summary, "한 줄 소개가 여기에 보입니다."),
    description: list(values.description),
    topic: text(values.topic, "주제"),
    status: end && end < currentYearMonthKst() ? "past" : "current",
    period: { start: yearMonth(period.start), end },
    leader: text(values.leader, "리더"),
    participants: list(values.participants),
    format: format || undefined,
    outputs: [],
    createdAt: NOW,
    updatedAt: NOW,
  } as Study;
}

/** 입력 중인 일정 폼 값 → 일정 줄 미리보기 */
export function previewEvent(values: Record<string, unknown>): EventItem {
  const optional = (value: unknown) =>
    typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
  const date = typeof values.date === "string" && isIsoDate(values.date) ? values.date : todayKst();
  const endDate =
    typeof values.endDate === "string" && isIsoDate(values.endDate) ? values.endDate : undefined;
  return {
    id: 0,
    title: text(values.title, "일정 제목"),
    category: oneOf<EventCategory>(EVENT_CATEGORIES, values.category, "meeting"),
    date,
    endDate,
    time: optional(values.time),
    place: optional(values.place),
    summary: optional(values.summary),
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
  } as EventItem;
}
