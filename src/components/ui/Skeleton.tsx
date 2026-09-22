import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type SkeletonProps = ComponentPropsWithoutRef<"div">;

/**
 * 로딩 자리 표시 (C-10). 크기는 className 으로 준다.
 * 스크린리더에는 감추고, 로딩 안내는 감싸는 영역의 aria-busy 로 전달한다.
 * "모션 줄이기" 설정에서는 깜빡임을 끈다.
 */
export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-line motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
