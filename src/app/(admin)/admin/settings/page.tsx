import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsScreen from "@/features/settings/admin/SettingsScreen";

export const metadata: Metadata = {
  title: "사이트 설정",
};

// A-50 사이트 설정 (IA 8-4). 데이터는 브라우저에서 BFF 로 불러온다.
export default function AdminSettingsPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader
        title="사이트 설정"
        description="홈 화면의 모집 상태 · 활동 통계를 바꿉니다."
      />
      <SettingsScreen />
    </section>
  );
}
