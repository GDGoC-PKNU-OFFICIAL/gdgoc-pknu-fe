import Image from "next/image";
import Link from "next/link";

import BackToTop from "@/components/layout/BackToTop";
import SocialLinks from "@/components/layout/SocialLinks";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SITE } from "@/data/site";

/**
 * 공개 사이트 Footer (IA 3-3). 검은 바탕 — 로고는 글자만 흰 버전(gdgoc-pknu-white.svg)을 쓴다.
 * - 위: 로고 · 소개 (왼쪽) + Back to top (오른쪽) → Email → SNS 아이콘 순으로 왼쪽 정렬
 * - 메뉴(내비게이션) 링크 · GDG Community 링크는 두지 않는다
 * - 개인정보처리방침은 법적 고지라 하단 바에 예외로 둔다
 */
export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-14 pb-10 md:px-8">
        <div className="flex flex-col gap-10">
          <div className="flex items-start justify-between gap-6">
            {/* 브랜드 */}
            <div className="flex flex-col gap-3">
              <Image
                src="/logo/gdgoc-pknu-white.svg"
                alt="GDG on Campus PKNU"
                width={216}
                height={48}
                className="w-40 sm:w-54"
              />
              <p className="text-sm break-keep text-white/60">{SITE.tagline}</p>
            </div>
            <BackToTop />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs text-white/50">Email</p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="inline-flex min-h-11 items-center self-start text-base text-white hover:text-[#8ab4f8]"
            >
              {SITE.contactEmail}
            </a>
          </div>

          {/* SNS — GA4 sns_click 을 세려고 클라이언트 컴포넌트로 뺐다 */}
          <SocialLinks />
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
          <p>
            © {SITE.copyrightYear} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
