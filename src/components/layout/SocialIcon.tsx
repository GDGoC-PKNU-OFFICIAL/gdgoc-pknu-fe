import { siDiscord, siGithub, siInstagram } from "simple-icons";

import { type SocialChannel } from "@/data/social-links";

// 브랜드 로고 path 는 simple-icons(CC0) 에서 가져온다 — 손으로 옮겨 적으면 모양이 틀어진다.
const ICONS = {
  github: siGithub,
  discord: siDiscord,
  instagram: siInstagram,
} satisfies Record<SocialChannel, { path: string }>;

interface SocialIconProps {
  channel: SocialChannel;
  className?: string;
}

/** SNS 로고 아이콘. 장식용이므로 이름은 감싸는 링크의 aria-label 이 전달한다. */
export default function SocialIcon({ channel, className }: SocialIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={ICONS[channel].path} />
    </svg>
  );
}
