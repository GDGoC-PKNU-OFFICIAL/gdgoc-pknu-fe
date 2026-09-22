import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipToContent, { MAIN_CONTENT_ID } from "@/components/layout/SkipToContent";

/**
 * 공개 사이트 공통 레이아웃 (IA 3-1). 약속 섹션은 페이지마다 내용이 달라 각 page.tsx 가 하단에 직접 둔다.
 * 관리자((admin))는 이 레이아웃을 쓰지 않는다 (FRONT_ARCHITECTURE § 2 원칙 4).
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipToContent />
      <Header />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
