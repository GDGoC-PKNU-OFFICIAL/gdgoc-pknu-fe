import Link from "next/link";

import { type Metadata } from "next";

import { buttonStyles } from "@/components/ui/Button";
import { PUBLIC_ROUTES } from "@/constants/routes";

// P-99 404 (IA 4장). 루트 not-found 는 (public) 레이아웃 밖이라 Header · Footer 없이 단독으로 뜬다.
// 404 응답에는 Next 가 noindex 를 자동으로 붙인다 (IA 10-4: 색인 ❌).
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-blue tabular-nums">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm break-keep text-ink-muted">
          주소가 바뀌었거나 삭제된 페이지입니다. 홈에서 다시 찾아 주세요.
        </p>
      </div>
      <Link href={PUBLIC_ROUTES.home} className={buttonStyles()}>
        홈으로
      </Link>
    </main>
  );
}
