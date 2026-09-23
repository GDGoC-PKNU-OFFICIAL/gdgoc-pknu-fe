import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

const VARIANT_CLASSES = {
  primary: "bg-brand-blue text-white hover:bg-brand-blue/90",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-muted",
  ghost: "text-ink hover:bg-surface-muted",
} as const;

const SIZE_CLASSES = {
  // 모든 터치 요소 최소 44×44px (IA 5-7) → md 이상은 min-h-11(44px)
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
  icon: "size-11",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * 버튼 모양 클래스만 돌려준다. 이동이 목적이면 <button> 이 아니라 링크에 이 클래스를 입힌다.
 * @example <Link href="/" className={buttonStyles({ variant: "secondary" })}>홈으로</Link>
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & ButtonStyleOptions;

export default function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  // type 기본값을 "button" 으로 둔다 — form 안에서 의도치 않은 submit 방지
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
