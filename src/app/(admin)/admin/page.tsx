import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DashboardScreen from "@/components/admin/DashboardScreen";

export const metadata: Metadata = {
  title: "대시보드",
};

// A-00 대시보드 — 콘텐츠별 건수 · 모집 상태 요약 · 바로가기 (IA 2-2). 데이터는 브라우저에서 BFF 로 불러온다.
export default function AdminDashboardPage() {
  return (
    <section className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <AdminPageHeader title="대시보드" />
      <DashboardScreen />
    </section>
  );
}
