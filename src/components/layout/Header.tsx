import Image from "next/image";
import Link from "next/link";

import MobileNav from "@/components/layout/MobileNav";
import NavLinks from "@/components/layout/NavLinks";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { PUBLIC_ROUTES } from "@/constants/routes";

/**
 * 공개 사이트 GNB (IA 3-2). 서버 컴포넌트이고, 경로를 읽는 NavLinks 와 메뉴를 여닫는 MobileNav 만 클라이언트다.
 * 관리자 페이지로 가는 링크는 두지 않는다.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* 로고 비율 · 색을 임의로 바꾸지 않는다 (PRD 3-2) */}
        {/*
          심볼은 이미지, "GDGoC PKNU" 는 글자로 쓴다 — 굵기 · 크기를 깨짐 없이 맞출 수 있다.
          가운데 메뉴와 겹치지 않게 태블릿 폭(md)에서만 조금 줄인다.
        */}
        <Link
          href={PUBLIC_ROUTES.home}
          aria-label="GDG on Campus PKNU 홈"
          className="flex min-h-11 items-center gap-2 md:gap-1.5 lg:gap-2"
        >
          <Image
            src="/logo/gdgoc-symbol.png"
            alt=""
            width={174}
            height={96}
            priority
            className="h-6 w-auto md:h-5 lg:h-6"
          />
          <span className="text-lg font-semibold tracking-tight whitespace-nowrap text-ink md:text-base lg:text-lg">
            GDGoC PKNU
          </span>
        </Link>

        {/* 로고 폭과 상관없이 헤더 정중앙에 둔다 */}
        <nav
          aria-label="주 메뉴"
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <NavLinks orientation="horizontal" />
        </nav>

        {/* 오른쪽: 테마 전환(모든 화면) · 모바일 메뉴 */}
        <div className="-mr-2 flex items-center">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
