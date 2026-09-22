import Image from "next/image";
import Link from "next/link";

import SocialIcon from "@/components/layout/SocialIcon";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SITE } from "@/data/site";
import { SOCIAL_LINKS } from "@/data/social-links";

/**
 * 공개 사이트 Footer (IA 3-3).
 * - 메뉴(내비게이션) 링크 · GDG Community 링크는 두지 않는다
 * - 개인정보처리방침은 법적 고지라 하단 바에 예외로 둔다
 */
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* 브랜드 */}
          <div className="flex flex-col gap-3">
            <Image src="/logo/gdgoc-pknu.svg" alt="GDG on Campus PKNU" width={144} height={32} />
            <p className="text-sm break-keep text-ink-muted">{SITE.tagline}</p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="inline-flex min-h-11 items-center self-start text-sm text-ink-muted hover:text-brand-blue"
            >
              {SITE.contactEmail}
            </a>
          </div>

          {/* SNS — 로고 아이콘만, 순서 GitHub → Discord → Instagram */}
          <ul className="flex gap-2">
            {SOCIAL_LINKS.map(({ channel, ariaLabel, href }) => (
              <li key={channel}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <SocialIcon channel={channel} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 하단 바 */}
        <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3">
            <span>{SITE.affiliation}</span>
            <span aria-hidden="true">·</span>
            <Link
              href={PUBLIC_ROUTES.privacy}
              className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-brand-blue"
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
