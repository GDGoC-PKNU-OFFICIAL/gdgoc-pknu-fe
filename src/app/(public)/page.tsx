import { type Metadata } from "next";

import PromiseSection from "@/components/common/PromiseSection";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// P-00 홈 — 히어로 · 통계 · 진행 중 프로젝트/스터디 · 일정 · 코어멤버는 Phase 3 에서 채운다.
export default function HomePage() {
  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-24 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">GDG on Campus PKNU</h1>
        <p className="text-ink-muted">홈 본문은 Phase 3 에서 구현됩니다.</p>
      </section>
      <PromiseSection page="home" />
    </>
  );
}
