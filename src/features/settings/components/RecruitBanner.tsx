import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/date";
import type { SiteSetting } from "@/types/api";

type RecruitBannerProps = Pick<SiteSetting, "recruiting" | "recruitPeriod">;

/**
 * 모집 상태 (C-01, P-00 히어로). 타이틀 위에 놓는 작은 보조 정보라 카드 · 배너 모양으로 만들지 않는다.
 * 표시만 하고 지원 버튼은 없다 — 지원 접수는 사이트 밖에서 한다 (PRD MVP 범위).
 * 모집 상태 · 기간은 관리자 사이트 설정(A-50)에서 바꾼다. 기간이 없으면 상태만 보여 준다.
 * 배너 문구(bannerText)는 화면에 표시하지 않기로 했다.
 */
export default function RecruitBanner({ recruiting, recruitPeriod }: RecruitBannerProps) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium",
          recruiting ? "bg-[#E8F0FF] text-[#2459B5]" : "bg-surface-muted text-ink-muted",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", recruiting ? "bg-brand-blue" : "bg-ink-muted")}
        />
        {recruiting ? "모집중" : "모집 마감"}
      </span>
      {recruitPeriod && (
        <>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <span className="inline-flex items-center gap-2 text-[#555B65] tabular-nums">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 3v4M17 3v4M4 10h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
            {formatIsoDate(recruitPeriod.start)} – {formatIsoDate(recruitPeriod.end)}
          </span>
        </>
      )}
    </div>
  );
}
