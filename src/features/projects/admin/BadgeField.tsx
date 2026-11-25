"use client";

import { type UseFormRegister } from "react-hook-form";

import { FormFieldset } from "@/components/admin/FormField";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { PROJECT_LIMITS } from "@/constants/limits";
import { cn } from "@/lib/cn";
import {
  BADGE_COLORS,
  type BadgeColor,
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/types/api";

import { BADGE_COLOR_LABELS, BADGE_COLOR_TONES, projectBadge } from "../lib/project-labels";

import type { ProjectFormValues } from "./project-schema";

interface BadgeFieldProps {
  register: UseFormRegister<ProjectFormValues>;
  /** 지금 입력된 값 (useWatch) — 미리보기용 */
  label: string;
  color: BadgeColor;
  category: string;
  error?: string;
}

/** 색 고르기 버튼의 진한 색 점 (배지 글자 색과 같은 계열, 관리자는 라이트 테마라 한 벌만) */
const SWATCH_COLORS = {
  blue: "#1a73e8",
  green: "#1e8e3e",
  red: "#d93025",
  yellow: "#f9ab00",
  purple: "#8430ce",
  gray: "#80868b",
} satisfies Record<BadgeColor, string>;

function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

/**
 * 프로젝트 배지 입력 (카드 · 상세의 작은 라벨) — 글자 + 정해진 팔레트 색 + 미리보기.
 * 글자를 비우면 배지를 따로 두지 않고 유형 이름 · 유형 기본 색으로 보인다.
 * 색 버튼은 실제 배지 모양으로 그려, 라이트 · 다크 어느 쪽에서도 보이는 그대로 고를 수 있다.
 */
export default function BadgeField({ register, label, color, category, error }: BadgeFieldProps) {
  const trimmed = label.trim();
  const preview = isProjectCategory(category)
    ? projectBadge({
        category,
        badge: trimmed ? { label: trimmed, color } : undefined,
      })
    : trimmed
      ? { label: trimmed, tone: BADGE_COLOR_TONES[color] }
      : null;

  return (
    <FormFieldset
      id="project-badge"
      legend="배지"
      hint="카드 왼쪽 위에 보이는 작은 라벨입니다. 비워 두면 유형 이름이 유형 기본 색으로 보입니다."
      error={error}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-badge-label" className="sr-only">
            배지 글자
          </label>
          <Input
            id="project-badge-label"
            maxLength={PROJECT_LIMITS.badgeLabel}
            placeholder={
              isProjectCategory(category) ? PROJECT_CATEGORY_LABELS[category] : "예: 해커톤 수상"
            }
            invalid={Boolean(error)}
            {...register("badge.label")}
          />
        </div>

        {/*
          색 고르기 — 연한 배지 모양 그대로 두면 글자 · 바탕이 모두 흐려 잘 안 보인다.
          진한 색 점 + 진한 글자로 그리고, 고른 색은 진한 테두리 + ✓ 로 표시한다. 실제 모양은 아래 미리보기에서 본다.
        */}
        <div role="radiogroup" aria-label="배지 색" className="flex flex-wrap gap-2">
          {BADGE_COLORS.map((value) => {
            const selected = value === color;
            return (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  className="peer sr-only"
                  {...register("badge.color")}
                />
                <span
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-full border bg-surface px-3.5 text-sm font-medium text-ink transition-colors",
                    "hover:bg-surface-muted",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-blue",
                    selected ? "border-2 border-ink bg-surface-muted" : "border-line",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: SWATCH_COLORS[value] }}
                  />
                  {BADGE_COLOR_LABELS[value]}
                  {selected && (
                    <span aria-hidden="true" className="text-xs">
                      ✓
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        {!trimmed && (
          <p className="text-xs text-ink-muted">
            배지 글자를 적으면 고른 색으로 보입니다. 지금은 유형 기본 색으로 보입니다.
          </p>
        )}

        {preview && (
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            미리보기
            <Badge tone={preview.tone}>{preview.label}</Badge>
          </p>
        )}
      </div>
    </FormFieldset>
  );
}
