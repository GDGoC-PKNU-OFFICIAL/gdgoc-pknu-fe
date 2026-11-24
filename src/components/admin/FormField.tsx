import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

import CharCounter from "./CharCounter";

/** 입력칸에 그대로 펼쳐 넣는 속성 — 라벨 · 안내 · 에러 · 카운터와 연결된다 */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-required"?: true;
  invalid: boolean;
}

interface FieldIds {
  hintId: string;
  errorId: string;
  counterId: string;
}

function fieldIds(id: string): FieldIds {
  return { hintId: `${id}-hint`, errorId: `${id}-error`, counterId: `${id}-counter` };
}

function describedBy(ids: (string | false | undefined)[]): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="ml-0.5 text-brand-red">
        *
      </span>
      <span className="sr-only">(필수)</span>
    </>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** 입력 규칙 안내 (예: "영문 소문자 · 숫자 · 하이픈") */
  hint?: ReactNode;
  error?: string;
  /** 글자 수 카운터 */
  counter?: { length: number; max: number };
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * 관리자 폼의 입력 한 칸 — 라벨 · 입력칸 · 안내 · 글자 수 · 에러 (IA 8-4).
 * 입력칸은 render prop 으로 받아 id · aria-describedby 를 붙여 준다.
 */
export default function FormField({
  id,
  label,
  required,
  hint,
  error,
  counter,
  className,
  children,
}: FormFieldProps) {
  const { hintId, errorId, counterId } = fieldIds(id);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <RequiredMark />}
        </label>
        {counter && <CharCounter id={counterId} length={counter.length} max={counter.max} />}
      </div>
      {children({
        id,
        "aria-describedby": describedBy([
          error && errorId,
          hint !== undefined && hintId,
          counter && counterId,
        ]),
        "aria-required": required || undefined,
        invalid: Boolean(error),
      })}
      {hint !== undefined && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormFieldsetProps {
  id: string;
  legend: string;
  required?: boolean;
  hint?: ReactNode;
  /** 묶음 전체 에러 (개수 초과 · 시작 ≤ 종료 등) */
  error?: string;
  className?: string;
  children: ReactNode;
}

/** 여러 입력칸을 묶는 칸 — 반복 입력(팀원 · 기능) · 연월 선택 등. 안내 · 에러는 묶음에 붙는다 */
export function FormFieldset({
  id,
  legend,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldsetProps) {
  const { hintId, errorId } = fieldIds(id);
  return (
    <fieldset
      id={id}
      aria-describedby={describedBy([error && errorId, hint !== undefined && hintId])}
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <legend className="mb-1.5 text-sm font-medium">
        {legend}
        {required && <RequiredMark />}
      </legend>
      {hint !== undefined && (
        <p id={hintId} className="-mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * 폼 그룹 패널 — IA 8-4 표의 "그룹"(기본 · 기간 · 썸네일 …).
 * 업무용 화면(ERP)처럼 회색 제목 띠 + 흰 본문으로 나눠, 긴 폼에서도 구역 경계가 한눈에 보이게 한다.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-0.5 border-b border-line bg-surface-muted px-4 py-2.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-5 p-4 md:p-5">{children}</div>
    </section>
  );
}
