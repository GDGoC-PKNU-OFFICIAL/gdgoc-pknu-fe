import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/date";
import type { SiteSetting } from "@/types/api";

type RecruitBannerProps = Pick<SiteSetting, "recruiting" | "bannerText" | "recruitPeriod">;

/**
 * 모집 상태 배너 (C-01, P-00 #1). 표시만 하고 지원 버튼은 없다 — 지원 접수는 사이트 밖에서 한다 (PRD MVP 범위).
 * 모집중이면 강조하고, 마감이면 "모집 마감"으로 보여 준다.
 */
export default function RecruitBanner({
  recruiting,
  bannerText,
  recruitPeriod,
}: RecruitBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-3",
        recruiting ? "border-brand-green/40 bg-brand-green/10" : "border-line bg-surface-muted",
      )}
    >
      <Badge tone={recruiting ? "green" : "neutral"} className="self-start sm:self-auto">
        {recruiting ? "모집중" : "모집 마감"}
      </Badge>
      <p className="text-sm break-keep">{bannerText}</p>
      {recruitPeriod && (
        <p className="text-sm text-ink-muted tabular-nums sm:ml-auto">
          {formatIsoDate(recruitPeriod.start)} – {formatIsoDate(recruitPeriod.end)}
        </p>
      )}
    </div>
  );
}
