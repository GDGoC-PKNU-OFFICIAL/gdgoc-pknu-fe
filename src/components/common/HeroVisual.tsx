import { cn } from "@/lib/cn";

/**
 * 홈 히어로 오른쪽 장식 — 유리 느낌의 추상 오브젝트와 궤도. 궤도 위 네 점은 GDG 로고의 Google 4색이다.
 * 이미지 파일 없이 SVG 로 그려 용량 · 해상도 걱정이 없다. 내용이 없는 장식이라 스크린리더에서 숨긴다.
 */
export default function HeroVisual({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 560"
      className={cn("h-auto w-full overflow-visible", className)}
    >
      <defs>
        <radialGradient id="hero-glass" cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#e6eeff" stopOpacity="0.7" />
          <stop offset="74%" stopColor="#cfd6ff" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#b6c9ff" stopOpacity="0.78" />
        </radialGradient>
        <radialGradient id="hero-core" cx="62%" cy="66%" r="62%">
          <stop offset="0%" stopColor="#c4d4ff" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#dcd2ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#c6d6ff" />
          <stop offset="100%" stopColor="#d6c9ff" />
        </linearGradient>
        <linearGradient id="hero-orbit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8fb0f5" stopOpacity="0" />
          <stop offset="50%" stopColor="#8fb0f5" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#b6a4f2" stopOpacity="0.1" />
        </linearGradient>
        <filter id="hero-blur-wide" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="44" />
        </filter>
        <filter id="hero-blur-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {/* 뒤쪽 빛 */}
      <ellipse
        cx="320"
        cy="300"
        rx="230"
        ry="205"
        fill="#cddcff"
        opacity="0.8"
        filter="url(#hero-blur-wide)"
      />

      {/* 궤도 (오브젝트 뒤로 지나가는 쪽) */}
      <g transform="rotate(-20 300 280)">
        <path
          d="M28 280 A272 88 0 0 1 572 280"
          fill="none"
          stroke="url(#hero-orbit)"
          strokeWidth="1.5"
        />
      </g>

      {/* 유리 오브젝트 */}
      <path
        d="M300 92C404 82 500 150 510 262C520 374 436 472 318 480C200 488 102 416 92 298C82 180 196 102 300 92Z"
        fill="url(#hero-glass)"
        stroke="url(#hero-rim)"
        strokeWidth="2"
      />
      <path
        d="M318 176C396 170 452 224 452 296C452 370 392 424 316 424C246 424 192 372 192 304C192 234 244 182 318 176Z"
        fill="url(#hero-core)"
        filter="url(#hero-blur-soft)"
      />
      <path
        d="M186 188C218 146 268 124 318 122"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
        filter="url(#hero-blur-soft)"
      />

      {/* 궤도 (오브젝트 앞으로 지나가는 쪽) + Google 4색 점 */}
      <g transform="rotate(-20 300 280)">
        <path
          d="M28 280 A272 88 0 0 0 572 280"
          fill="none"
          stroke="url(#hero-orbit)"
          strokeWidth="2"
        />
        <circle cx="120" cy="342" r="9" fill="#4285f4" />
        <circle cx="250" cy="367" r="7" fill="#ea4335" />
        <circle cx="392" cy="363" r="8" fill="#fbbc04" />
        <circle cx="506" cy="336" r="6" fill="#34a853" />
      </g>
    </svg>
  );
}
