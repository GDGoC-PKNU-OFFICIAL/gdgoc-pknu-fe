import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import ThemeSync from "@/components/common/ThemeSync";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipToContent, { MAIN_CONTENT_ID } from "@/components/layout/SkipToContent";

/**
 * 공개 사이트 공통 레이아웃 (IA 3-1). 약속 · 강령 섹션은 팀 결정으로 모든 페이지에서 뺐다.
 * 관리자((admin))는 이 레이아웃을 쓰지 않는다 (FRONT_ARCHITECTURE § 2 원칙 4).
 * GA4 는 여기서만 싣는다 — 관리자 화면은 측정하지 않는다 (NEXT_PUBLIC_GA_ID 가 없으면 싣지 않음).
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ThemeSync area="public" />
      <SkipToContent />
      <Header />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
      <GoogleAnalytics />
    </>
  );
}
