import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AboutScreen from "@/features/about/admin/AboutScreen";

export const metadata: Metadata = {
  title: "About",
};

// About 수정 — 소개 · What We Do 카드 · 활동 규칙 · FAQ. 데이터는 브라우저에서 BFF 로 불러온다.
export default function AdminAboutPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-5 md:px-6">
      <AdminPageHeader
        title="About"
        description="About 페이지의 소개 · 활동 카드 · 활동 규칙 · FAQ 를 바꿉니다. 활동 카드는 홈 What We Do 에도 쓰입니다."
      />
      <AboutScreen />
    </section>
  );
}
