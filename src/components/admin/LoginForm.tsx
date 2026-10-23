"use client";

import { type FormEvent, useState } from "react";

import Button from "@/components/ui/Button";
import { LOGIN_LIMITS } from "@/constants/limits";
import { login } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { cn } from "@/lib/cn";
import type { LoginRequest } from "@/types/request";

type LoginField = keyof LoginRequest;
type FieldErrors = Partial<Record<LoginField, string>>;

/** 이 시간이 지나도 응답이 없으면 Render 콜드 스타트로 보고 안내를 띄운다 (IA 8-5 "서버 깨우는 중") */
const SLOW_NOTICE_MS = 3_000;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  loginIdTooLong: `아이디는 ${LOGIN_LIMITS.loginId}자 이하로 입력해 주세요.`,
  expired: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  waking: "서버를 깨우는 중입니다. 최대 30초 걸릴 수 있습니다.",
  unknown: "일시적인 오류가 발생했습니다.",
} as const;

/** 명세 4-1 과 같은 규칙. 서버도 다시 검사하므로 여기서는 요청 전 빠른 안내용이다 */
function validate({ loginId, password }: LoginRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (loginId === "") errors.loginId = MESSAGES.required;
  else if (loginId.length > LOGIN_LIMITS.loginId) errors.loginId = MESSAGES.loginIdTooLong;
  if (password.trim() === "") errors.password = MESSAGES.required;
  return errors;
}

function isLoginField(field: string): field is LoginField {
  return field === "loginId" || field === "password";
}

interface LoginFormProps {
  /** ?next= 원본 값. 검사는 성공 시점에 safeNextPath 가 한다 */
  next: string | null;
  /** ?reason=expired 로 왔는지 */
  expired: boolean;
}

/**
 * A-01 로그인 폼 (PRD 4-3 · IA 8-2). 공용 계정 1개, 회원가입 · 비밀번호 찾기 없음.
 * 성공하면 전체 이동으로 next(검사 통과 시) 또는 /admin 으로 간다 — 새 쿠키로 proxy.ts 를 다시 거치게 하기 위해서다.
 */
export default function LoginForm({ next, expired }: LoginFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // ref 대신 제출한 form 요소에서 입력칸을 찾는다 (포커스 이동 · 비밀번호 비우기)
    const form = event.currentTarget;
    const input = (name: LoginField) => form.elements.namedItem(name) as HTMLInputElement | null;
    const showFieldErrors = (errors: FieldErrors) => {
      setFieldErrors(errors);
      const first = (["loginId", "password"] as const).find((field) => errors[field]);
      if (first) input(first)?.focus();
    };

    const data = new FormData(form);
    const body: LoginRequest = {
      loginId: String(data.get("loginId") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    };

    setFormError(null);
    const errors = validate(body);
    if (Object.keys(errors).length > 0) {
      showFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    try {
      await login(body);
      window.location.assign(safeNextPath(next));
      return; // 이동하는 동안 버튼은 계속 비활성으로 둔다
    } catch (error) {
      setPending(false);
      if (!(error instanceof ApiError)) {
        setFormError(MESSAGES.unknown);
        return;
      }
      const serverFieldErrors: FieldErrors = {};
      for (const { field, message } of error.fieldErrors) {
        if (isLoginField(field)) serverFieldErrors[field] = message;
      }
      if (Object.keys(serverFieldErrors).length > 0) showFieldErrors(serverFieldErrors);
      else setFormError(error.message); // LOGIN_FAILED · 연결 실패 · 시간 초과
      if (error.code === "LOGIN_FAILED") {
        const password = input("password");
        if (password) password.value = "";
        password?.focus();
      }
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {expired && formError === null && (
        <p role="status" className="rounded-lg bg-brand-yellow/15 px-4 py-3 text-sm text-ink">
          {MESSAGES.expired}
        </p>
      )}
      {formError !== null && (
        <p role="alert" className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
          {formError}
        </p>
      )}

      <Field
        name="loginId"
        label="아이디"
        type="text"
        autoComplete="username"
        maxLength={LOGIN_LIMITS.loginId}
        error={fieldErrors.loginId}
      />
      <Field
        name="password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        error={fieldErrors.password}
      />

      <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
        {pending ? "로그인 중…" : "로그인"}
      </Button>
      <p aria-live="polite" className="min-h-5 text-center text-xs text-ink-muted">
        {slow ? MESSAGES.waking : ""}
      </p>
    </form>
  );
}

interface FieldProps {
  name: LoginField;
  label: string;
  type: "text" | "password";
  autoComplete: string;
  maxLength?: number;
  error?: string;
}

function Field({ name, label, type, autoComplete, maxLength, error }: FieldProps) {
  const inputId = `login-${name}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-11 rounded-lg border bg-surface px-3 text-base outline-none",
          "focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/30",
          error ? "border-brand-red" : "border-line",
        )}
      />
      {error && (
        <p id={errorId} className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
