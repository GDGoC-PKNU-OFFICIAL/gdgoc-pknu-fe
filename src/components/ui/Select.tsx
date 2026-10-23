import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { fieldControlStyles } from "./Input";

/** 선택지. 라벨은 호출하는 쪽이 넘긴다 — components/ui 는 constants/labels 를 모른다 */
export interface SelectOption {
  value: string;
  label: string;
}

type SelectProps = Omit<ComponentPropsWithRef<"select">, "children"> & {
  options: readonly SelectOption[];
  /** 맨 앞에 두는 빈 값("") 선택지 문구. 예: "전체", "선택해 주세요" */
  placeholder?: string;
  invalid?: boolean;
};

/** 네이티브 <select>. 모바일에서 OS 선택 화면이 떠 접근성 · 터치 처리를 브라우저에 맡긴다 */
export default function Select({
  options,
  placeholder,
  invalid,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      aria-invalid={invalid ? true : undefined}
      className={fieldControlStyles({ invalid, className: cn("pr-8", className) })}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
