import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { fieldControlStyles } from "./Input";

type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  invalid?: boolean;
};

/** 여러 줄 입력칸. 높이는 rows 로 정하고 사용자가 세로로만 늘릴 수 있다 */
export default function Textarea({ invalid, className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid ? true : undefined}
      className={fieldControlStyles({
        invalid,
        className: cn("resize-y py-2 leading-relaxed", className),
      })}
      {...props}
    />
  );
}
