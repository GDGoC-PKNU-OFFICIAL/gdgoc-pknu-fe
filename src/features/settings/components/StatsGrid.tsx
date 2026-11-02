import type { SiteStat } from "@/types/api";

/** 활동 통계 (P-00 #2). 항상 4칸. 2열 × 2행, 데스크톱 4열 × 1행 (IA 5-7) */
export default function StatsGrid({ stats }: { stats: SiteStat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map(({ label, value, unit, suffix }) => (
        <div
          key={label}
          className="flex flex-col-reverse gap-1 rounded-2xl border border-line bg-surface p-5"
        >
          <dt className="text-sm break-keep text-ink-muted">{label}</dt>
          <dd className="text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
            {value.toLocaleString("ko-KR")}
            {unit && <span className="ml-0.5 text-lg font-semibold">{unit}</span>}
            {suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
