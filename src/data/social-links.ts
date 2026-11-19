// src/data/social-links.ts
// Footer SNS 아이콘 (PRD 3-2 · IA 3-3). 배열 순서 = 화면 순서: GitHub → Gmail → Instagram.
// Gmail 은 연락 메일(SITE.contactEmail)로 메일 쓰기를 연다 — Footer 의 Email 블록을 대신한다.
// channel 값은 GA4 sns_click 의 channel 파라미터(IA 10-5)와 같다.

import { SITE } from "@/data/site";

export const SOCIAL_CHANNELS = ["github", "gmail", "instagram"] as const;
export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];

export interface SocialLink {
  channel: SocialChannel;
  /** 아이콘만 있으므로 스크린리더용 이름이 필수다 */
  ariaLabel: string;
  href: string;
}

export const SOCIAL_LINKS = [
  {
    channel: "github",
    ariaLabel: "GDGoC PKNU GitHub",
    href: "https://github.com/GDGoC-PKNU-OFFICIAL",
  },
  {
    channel: "gmail",
    ariaLabel: `GDGoC PKNU 이메일 보내기 (${SITE.contactEmail})`,
    href: `mailto:${SITE.contactEmail}`,
  },
  {
    channel: "instagram",
    ariaLabel: "GDGoC PKNU Instagram",
    href: "https://www.instagram.com/gdg.pknu/",
  },
] as const satisfies readonly SocialLink[];
