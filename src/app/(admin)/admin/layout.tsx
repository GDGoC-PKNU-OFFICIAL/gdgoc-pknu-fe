import AdminSidebar from "@/components/admin/AdminSidebar";
import SessionExpiryWatcher from "@/components/admin/SessionExpiryWatcher";
import SkipToContent, { MAIN_CONTENT_ID } from "@/components/layout/SkipToContent";
import Toaster from "@/components/ui/Toaster";

/**
 * 관리자 레이아웃 (IA 8-1) — 사이드바 + 세션 만료 감시 + Toaster.
 * 접근 제어는 proxy.ts 가 이 레이아웃보다 먼저 한다. 여기까지 왔으면 쿠키 JWT 가 유효하다.
 * 로그인(A-01)은 (auth)/admin/login 에 있어 이 레이아웃을 쓰지 않는다.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Toaster>
      <SessionExpiryWatcher />
      <SkipToContent />
      <div className="flex min-h-dvh flex-col md:flex-row">
        <AdminSidebar />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="min-w-0 flex-1 bg-surface-muted focus:outline-none"
        >
          {children}
        </main>
      </div>
    </Toaster>
  );
}
