"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { FormFieldset } from "./FormField";
import { type ListErrors } from "./lib/list-errors";

interface TagInputProps {
  id: string;
  legend: string;
  hint?: ReactNode;
  value: string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  /** constants/limits.ts 의 배열 제한 그대로 — 예: PROJECT_LIMITS.techStack */
  limits: { max: number; itemLength: number };
  errors: ListErrors;
  placeholder?: string;
}

/**
 * 태그 입력 (IA 8-4 "태그 입력") — 기술 스택 · 관심분야 · 참여자 이름.
 * Enter 또는 "추가" 버튼으로 넣는다. 중복 · 빈 값 · 개수 초과는 넣기 전에 막는다 (중복 불가 규칙: 명세 4-2 · 4-6).
 */
export default function TagInput({
  id,
  legend,
  hint,
  value,
  onChange,
  onBlur,
  limits,
  errors,
  placeholder,
}: TagInputProps) {
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const inputId = `${id}-input`;
  const full = value.length >= limits.max;
  const itemError = errors.items.find(Boolean);
  const error = errors.message ?? itemError;

  function add() {
    const tag = text.trim();
    if (tag === "") return;
    if (value.includes(tag)) {
      setNotice(`"${tag}" 은(는) 이미 있습니다.`);
      return;
    }
    if (full) {
      setNotice(`최대 ${limits.max}개까지 입력할 수 있습니다.`);
      return;
    }
    onChange([...value, tag]);
    setText("");
    setNotice(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 한글 조합 중 Enter 는 글자 확정이므로 무시한다
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault(); // 폼 제출 방지
    add();
  }

  return (
    <FormFieldset
      id={id}
      legend={legend}
      hint={hint ?? `Enter 로 추가 · 최대 ${limits.max}개, 항목당 ${limits.itemLength}자`}
      error={error}
    >
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface-muted py-1 pr-1 pl-3 text-sm"
            >
              {tag}
              <button
                type="button"
                aria-label={`${tag} 삭제`}
                onClick={() => onChange(value.filter((item) => item !== tag))}
                className="flex size-7 items-center justify-center rounded-full text-ink-muted hover:bg-line"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          id={inputId}
          aria-label={`${legend} 입력`}
          value={text}
          maxLength={limits.itemLength}
          placeholder={full ? `최대 ${limits.max}개` : placeholder}
          disabled={full}
          invalid={Boolean(error)}
          onChange={(event) => {
            setText(event.target.value);
            setNotice(null);
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
        <Button variant="secondary" disabled={full || text.trim() === ""} onClick={add}>
          추가
        </Button>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-ink-muted">
        {notice}
      </p>
    </FormFieldset>
  );
}
