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

        <div
          role="radiogroup"
          aria-label="배지 색"
          className={cn("flex flex-wrap gap-2", !trimmed && "opacity-50")}
        >
          {BADGE_COLORS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                value={value}
                className="peer sr-only"
                {...register("badge.color")}
              />
              <Badge
                tone={BADGE_COLOR_TONES[value]}
                className="min-h-9 px-3.5 ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand-blue"
              >
                {BADGE_COLOR_LABELS[value]}
              </Badge>
            </label>
          ))}
        </div>

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
