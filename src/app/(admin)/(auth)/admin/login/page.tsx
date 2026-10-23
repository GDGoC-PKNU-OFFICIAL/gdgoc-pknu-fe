import { type Metadata } from "next";

import LoginForm from "@/components/admin/LoginForm";
import { MAIN_CONTENT_ID } from "@/components/layout/SkipToContent";
import { ADMIN_NEXT_PARAM, ADMIN_REASON_EXPIRED, ADMIN_REASON_PARAM } from "@/constants/routes";

export const metadata: Metadata = {
  title: "로그인",
};

/**
 * A-01 로그인 (PRD 4-1 · IA 8-1 · 8-2). 사이드바 없이 단독으로 뜬다 — admin/layout.tsx 밖((auth)/)에 있다.
 * 로그인 상태로 오면 proxy.ts 가 이 페이지 전에 next 또는 /admin 으로 보낸다.
 * searchParams 를 읽으므로 동적 렌더링이다. 공개 페이지의 "쿼리는 클라이언트에서만" 제약(FRONT_ARCHITECTURE § 1)은
 * 콜드 스타트를 방문자에게서 숨기기 위한 것이라 관리자 화면에는 해당하지 않는다.
 */
export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = params[ADMIN_NEXT_PARAM];
  const reason = params[ADMIN_REASON_PARAM];

  return (
    <main
      id={MAIN_CONTENT_ID}
      className="flex min-h-dvh items-center justify-center bg-surface-muted px-4 py-12"
    >
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight">GDGoC Admin</h1>
          <p className="text-sm text-ink-muted">운영진 공용 계정으로 로그인해 주세요.</p>
        </div>
        <LoginForm
          next={typeof next === "string" ? next : null}
          expired={reason === ADMIN_REASON_EXPIRED}
        />
      </div>
    </main>
  );
}
