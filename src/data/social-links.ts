// src/data/social-links.ts
// Footer SNS 아이콘 (PRD 3-2 · IA 3-3). 배열 순서 = 화면 순서: GitHub → Discord → Instagram.
// channel 값은 GA4 sns_click 의 channel 파라미터(IA 10-5)와 같다.

export const SOCIAL_CHANNELS = ["github", "discord", "instagram"] as const;
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
    href: "https://github.com/GDSC-PKNU-Official",
  },
  {
    channel: "discord",
    ariaLabel: "GDGoC PKNU Discord",
    href: "https://discord.com/invite/5jZa5UGyrm",
  },
  {
    channel: "instagram",
    ariaLabel: "GDGoC PKNU Instagram",
    href: "https://www.instagram.com/gdg.pknu/",
  },
] as const satisfies readonly SocialLink[];

/** About 의 Discord 참여 CTA 가 쓰는 초대 링크 — Footer 와 같은 주소를 쓴다 */
export const DISCORD_INVITE_URL = SOCIAL_LINKS[1].href;
