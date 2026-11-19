import Image from "next/image";
import Link from "next/link";

import BackToTop from "@/components/layout/BackToTop";
import SocialLinks from "@/components/layout/SocialLinks";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SITE } from "@/data/site";

/**
 * 공개 사이트 Footer (IA 3-3). 검은 바탕 — 로고는 헤더와 같은 심볼 + 흰 글자다.
 * - 위: 왼쪽 로고 · 소개, 오른쪽 Back to top → SNS 아이콘(GitHub · Gmail · Instagram). 양쪽 위아래 끝선을 맞춘다
 * - 메뉴(내비게이션) 링크 · GDG Community 링크는 두지 않는다
 * - 개인정보처리방침은 법적 고지라 하단 바에 예외로 둔다
 */
export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white dark:border-t dark:border-line dark:bg-[#0a0c10]">
      <div className="mx-auto flex max-w-site flex-col gap-10 px-4 pt-12 pb-8 md:px-8">
        {/*
          두 기둥의 줄 높이를 맞춰 가로로 나란히 둔다.
          1줄: 로고 ↔ Back to top (44px) / 2줄: 소개 ↔ SNS 아이콘 (48px)
          연락 메일은 SNS 의 Gmail 아이콘이 대신한다.
        */}
        <div className="flex items-start justify-between gap-6">
          {/* 브랜드 */}
          <div className="flex flex-col gap-1">
            {/* 헤더와 같은 구성: 심볼 이미지 + "GDGoC PKNU" 글자 (검은 바탕이라 글자는 흰색) */}
            <p className="flex min-h-11 items-center gap-2.5">
              <Image
                src="/logo/gdgoc-symbol.png"
                alt=""
                width={174}
                height={96}
                className="h-7 w-auto"
              />
              <span className="text-xl font-semibold tracking-tight whitespace-nowrap text-white">
                GDGoC PKNU
              </span>
            </p>
            <p className="flex min-h-12 items-center text-sm break-keep text-white/60">
              {SITE.tagline}
            </p>
          </div>

          {/* SNS 는 GA4 sns_click 을 세려고 클라이언트 컴포넌트로 뺐다 */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <BackToTop />
            <SocialLinks />
          </div>
        </div>

        {/* 하단 바 */}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3">
            <span>{SITE.affiliation}</span>
            <span aria-hidden="true">·</span>
            <Link
              href={PUBLIC_ROUTES.privacy}
              className="inline-flex min-h-11 items-center font-semibold text-white hover:text-[#8ab4f8]"
            >
              개인정보처리방침
            </Link>
          </div>
          {/* 저작권 표시는 고정폭 글꼴(Geist Mono)로 쓴다 */}
          <p className="font-mono">
            © {SITE.copyrightYear} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
