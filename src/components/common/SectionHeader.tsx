import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** 한국어 배지 (IA 10-2) */
  badge: string;
  /** 영문 타이틀 */
  title: string;
  /** 한국어 부제 (선택) */
  subtitle?: string;
  /** 제목 요소 id — 섹션의 aria-labelledby 대상 */
  titleId?: string;
  align?: "left" | "center";
  className?: string;
}

/** 섹션 헤더: [한국어 배지] → 영문 타이틀 → 한국어 부제 (IA 10-2) */
export default function SectionHeader({
  badge,
  title,
  subtitle,
  titleId,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <Badge>{badge}</Badge>
      <h2 id={titleId} className="text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="text-sm break-keep text-ink-muted md:text-base">{subtitle}</p>}
    </div>
  );
}
