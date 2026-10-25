import { cn } from "@/lib/cn";

interface CharCounterProps {
  id?: string;
  length: number;
  max: number;
  className?: string;
}

/**
 * 글자 수 카운터 "12 / 40" (IA 8-4 "모든 텍스트 입력란에 글자 수 카운터").
 * 제한값은 호출하는 쪽이 constants/limits.ts 에서 넘긴다 — 숫자를 여기 두지 않는다 (FRONT_ARCHITECTURE § 9).
 */
export default function CharCounter({ id, length, max, className }: CharCounterProps) {
  const over = length > max;
  return (
    <span
      id={id}
      className={cn(
        "shrink-0 text-xs tabular-nums",
        over ? "font-semibold text-brand-red" : "text-ink-muted",
        className,
      )}
    >
      {length} / {max}
      <span className="sr-only">자</span>
    </span>
  );
}
