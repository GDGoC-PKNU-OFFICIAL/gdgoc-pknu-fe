import { type Metadata } from "next";

import ThemeSync from "@/components/common/ThemeSync";

/**
 * 관리자 영역 전체(로그인 A-01 포함) 공통 메타데이터. 화면 구성은 하위 레이아웃이 맡는다 —
 * 사이드바는 admin/layout.tsx, 로그인은 사이드바 없이 (auth)/ 아래에 둔다 (IA 8-1).
 * 모든 관리자 페이지는 색인하지 않는다 (PRD 4-1 · IA 8-1). robots.txt 차단(Phase 6)과 별개로 페이지에도 둔다.
 */
export const metadata: Metadata = {
  title: {
    default: "GDGoC Admin",
    template: "%s · GDGoC Admin",
  },
  robots: { index: false, follow: false },
};

/**
 * 관리자 화면은 항상 라이트 테마다 (공개 사이트에서 다크를 골랐어도).
 * 글자는 공개 사이트보다 한 단계 크게 쓴다 (globals.css admin-text) — 로그인 화면 포함.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="admin-text">
      <ThemeSync area="admin" />
      {children}
    </div>
  );
}
