"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * 화면에 들어오면 안쪽 [data-reveal-item] 들이 아래에서 위로 떠오르며 나타난다. 처음 한 번만.
 * 순서는 각 항목의 style `--reveal-order` (0, 1, 2 …) 로 주고, 한 칸에 0.1초씩 늦게 나온다.
 * 효과 자체는 globals.css 의 [data-reveal] 규칙이다 — JS 가 꺼져 있거나 "모션 줄이기"면 처음부터 보인다.
 * variant="blur" 면 흐릿하게 있다가 선명해지며 떠오른다 (About).
 */
export default function RevealOnScroll({
  children,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  className?: string;
  /** rise = 아래에서 떠오름(기본), blur = 흐림에서 선명하게 + 떠오름 */
  variant?: "rise" | "blur";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={shown ? "shown" : "pending"}
      data-reveal-variant={variant}
      className={className}
    >
      {children}
    </div>
  );
}
