import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
};

// A-00 대시보드 — 콘텐츠별 건수 · 모집 상태 요약 · 바로가기는 Phase 6 에서 채운다.
export default function AdminDashboardPage() {
  return (
    <section className="flex flex-col gap-2 px-4 py-8 md:px-8">
      <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
      <p className="text-sm text-ink-muted">대시보드 본문은 Phase 6 에서 구현됩니다.</p>
    </section>
  );
}
