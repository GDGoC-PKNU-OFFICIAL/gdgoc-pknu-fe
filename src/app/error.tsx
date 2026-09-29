"use client";

import { useEffect } from "react";

import Link from "next/link";

import Button, { buttonStyles } from "@/components/ui/Button";
import { PUBLIC_ROUTES } from "@/constants/routes";

interface ErrorPageProps {
  error: Error & { digest?: string };
  /** 해당 구간을 다시 가져와 다시 그린다 (Next 16.3 부터 reset 대신 retry 가 기본) */
  retry: () => void;
}

// 렌더 에러 경계 (FRONT_ARCHITECTURE § 3 · Phase 2 #10). 에러 경계는 클라이언트 컴포넌트여야 한다.
// 루트에 두므로 (public) 레이아웃까지 감싼다 → not-found 처럼 Header · Footer 없이 단독으로 뜬다.
// 공개 페이지는 ISR 이라 재생성 실패 시 기존 페이지가 유지되므로, 이 화면은 주로 개발 중 · 최초 요청 실패 때 보인다.
// 운영 빌드에서 서버 컴포넌트 에러의 message 는 가려지므로 화면에는 고정 문구만 쓰고 digest 만 보여 준다.
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">일시적인 오류가 발생했습니다</h1>
        <p className="text-sm break-keep text-ink-muted">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 홈에서 다시 찾아 주세요.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-ink-muted">오류 코드: {error.digest}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={retry}>다시 시도</Button>
        <Link href={PUBLIC_ROUTES.home} className={buttonStyles({ variant: "secondary" })}>
          홈으로
        </Link>
      </div>
    </main>
  );
}
