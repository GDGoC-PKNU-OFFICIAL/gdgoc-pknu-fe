"use client";

import { type ReactNode } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

import CharCounter from "./CharCounter";
import { FormFieldset } from "./FormField";
import { type ListErrors } from "./lib/list-errors";

interface StringListFieldProps {
  id: string;
  legend: string;
  required?: boolean;
  hint?: ReactNode;
  value: string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  /** constants/limits.ts 의 배열 제한 그대로 — 예: PROJECT_LIMITS.features */
  limits: { max: number; itemLength: number; min?: number };
  errors: ListErrors;
  /** 스크린 리더용 항목 이름. 예: (i) => `주요 기능 ${i + 1}` */
  itemLabel: (index: number) => string;
  addLabel: string;
  /** 여러 줄 입력(문단) */
  multiline?: boolean;
  placeholder?: string;
}

/**
 * 반복 입력 (IA 8-4 "반복 입력" · "여러 줄 (문단)"). 주요 기능 · 결과 · 프로젝트 소개 문단 등.
 * 입력칸은 모두 제어 컴포넌트라 중간 항목을 지워도 값이 밀리지 않는다.
 * 최대 개수에 닿으면 추가 버튼을 막는다 (서버 400 을 기다리지 않는다).
 */
export default function StringListField({
  id,
  legend,
  required,
  hint,
  value,
  onChange,
  onBlur,
  limits,
  errors,
  itemLabel,
  addLabel,
  multiline,
  placeholder,
}: StringListFieldProps) {
  const min = limits.min ?? 0;
  const full = value.length >= limits.max;

  const update = (index: number, text: string) =>
    onChange(value.map((item, i) => (i === index ? text : item)));
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <FormFieldset
      id={id}
      legend={legend}
      required={required}
      hint={hint ?? `최대 ${limits.max}개, 항목당 ${limits.itemLength}자`}
      error={errors.message}
    >
      {value.length > 0 && (
        <ol className="flex flex-col gap-3">
          {value.map((item, index) => {
            const itemId = `${id}-${index}`;
            const error = errors.items[index];
            const control = {
              id: itemId,
              value: item,
              maxLength: limits.itemLength,
              placeholder,
              invalid: Boolean(error),
              "aria-label": itemLabel(index),
              "aria-describedby": error ? `${itemId}-error` : undefined,
              onBlur,
            };
            return (
              // 제어 입력이라 인덱스 key 로도 값이 어긋나지 않는다 (항목에 고유 id 가 없다)
              <li key={index} className="flex flex-col gap-1">
                <div className="flex items-start gap-2">
                  {multiline ? (
                    <Textarea {...control} onChange={(e) => update(index, e.target.value)} />
                  ) : (
                    <Input {...control} onChange={(e) => update(index, e.target.value)} />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${itemLabel(index)} 삭제`}
                    disabled={value.length <= min}
                    onClick={() => remove(index)}
                    className="shrink-0 text-ink-muted"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </Button>
                </div>
                <div className="flex justify-between gap-3 pr-13">
                  <p id={`${itemId}-error`} className="text-xs text-brand-red">
                    {error}
                  </p>
                  <CharCounter length={item.length} max={limits.itemLength} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div>
        <Button variant="secondary" disabled={full} onClick={() => onChange([...value, ""])}>
          + {addLabel}
        </Button>
        {full && (
          <span className="ml-3 text-xs text-ink-muted">
            최대 {limits.max}개까지 입력할 수 있습니다.
          </span>
        )}
      </div>
    </FormFieldset>
  );
}
