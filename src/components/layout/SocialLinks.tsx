"use client";

import SocialIcon from "@/components/layout/SocialIcon";
import { SOCIAL_LINKS } from "@/data/social-links";
import { trackEvent } from "@/lib/analytics";

/**
 * Footer SNS 아이콘 (IA 3-3) — 로고 아이콘만, 순서 GitHub → Discord → Instagram.
 * 클릭을 GA4 sns_click 으로 센다 (IA 10-5). Footer 는 서버 컴포넌트로 두고 이 목록만 클라이언트로 뺐다.
 */
export default function SocialLinks() {
  return (
    <ul className="-ml-2 flex gap-2">
      {SOCIAL_LINKS.map(({ channel, ariaLabel, href }) => (
        <li key={channel}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            onClick={() => trackEvent("sns_click", { channel })}
            className="flex size-14 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <SocialIcon channel={channel} className="size-9" />
          </a>
        </li>
      ))}
    </ul>
  );
}
