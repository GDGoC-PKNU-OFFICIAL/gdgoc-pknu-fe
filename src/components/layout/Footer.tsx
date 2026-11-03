import Image from "next/image";
import Link from "next/link";

import SocialIcon from "@/components/layout/SocialIcon";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SITE } from "@/data/site";
import { SOCIAL_LINKS } from "@/data/social-links";

/**
 * 공개 사이트 Footer (IA 3-3). 검은 바탕 — 로고는 글자만 흰 버전(gdgoc-pknu-white.svg)을 쓴다.
 * - SNS 아이콘을 크게 가운데에 두고, 브랜드 문구는 그 아래에 가운데 정렬한다
 * - 메뉴(내비게이션) 링크 · GDG Community 링크는 두지 않는다
 * - 개인정보처리방침은 법적 고지라 하단 바에 예외로 둔다
 */
export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-14 pb-10 md:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* SNS — 로고 아이콘만, 순서 GitHub → Discord → Instagram */}
          <ul className="flex gap-4">
            {SOCIAL_LINKS.map(({ channel, ariaLabel, href }) => (
              <li key={channel}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  className="flex size-14 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <SocialIcon channel={channel} className="size-7" />
                </a>
              </li>
            ))}
          </ul>

          {/* 브랜드 */}
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/logo/gdgoc-pknu-white.svg"
              alt="GDG on Campus PKNU"
              width={144}
              height={32}
            />
            <p className="text-sm break-keep text-white/60">{SITE.tagline}</p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="inline-flex min-h-11 items-center text-sm text-white/60 hover:text-white"
            >
              {SITE.contactEmail}
            </a>
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
          <p>
            © {SITE.copyrightYear} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
