import Image from "next/image";
import Link from "next/link";

import MobileNav from "@/components/layout/MobileNav";
import NavLinks from "@/components/layout/NavLinks";
import { PUBLIC_ROUTES } from "@/constants/routes";

/**
 * 공개 사이트 GNB (IA 3-2). 서버 컴포넌트이고, 경로를 읽는 NavLinks 와 메뉴를 여닫는 MobileNav 만 클라이언트다.
 * 관리자 페이지로 가는 링크는 두지 않는다.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* 로고 비율 · 색을 임의로 바꾸지 않는다 (PRD 3-2) */}
        <Link href={PUBLIC_ROUTES.home} className="flex min-h-11 items-center">
          <Image
            src="/logo/gdgoc-pknu.svg"
            alt="GDG on Campus PKNU 홈"
            width={144}
            height={32}
            priority
          />
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <NavLinks orientation="horizontal" />
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
