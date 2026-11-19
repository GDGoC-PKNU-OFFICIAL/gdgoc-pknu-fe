"use client";

import SocialIcon from "@/components/layout/SocialIcon";
import { SOCIAL_LINKS } from "@/data/social-links";
import { trackEvent } from "@/lib/analytics";

/**
 * Footer SNS 아이콘 (IA 3-3, Back to top 아래 오른쪽) — 로고 아이콘만, 순서 GitHub → Gmail → Instagram.
 * 클릭을 GA4 sns_click 으로 센다 (IA 10-5). Footer 는 서버 컴포넌트로 두고 이 목록만 클라이언트로 뺐다.
 */
export default function SocialLinks() {
  return (
    <ul className="-mr-2 flex gap-1">
      {SOCIAL_LINKS.map(({ channel, ariaLabel, href }) => (
        <li key={channel}>
          <a
            href={href}
            // 메일(mailto:)은 메일 앱을 여는 것이라 새 탭을 띄우지 않는다
            {...(href.startsWith("mailto:")
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
            aria-label={ariaLabel}
            onClick={() => trackEvent("sns_click", { channel })}
            className="flex size-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <SocialIcon channel={channel} className="size-8" />
          </a>
        </li>
      ))}
    </ul>
  );
}
