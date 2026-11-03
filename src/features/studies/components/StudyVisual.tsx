import { useId } from "react";

import { cn } from "@/lib/cn";

import { type StudyVisualKind } from "../lib/study-visual";

/**
 * 스터디 카드 오른쪽 장식 — 분야를 상징하는 유리 느낌의 오브젝트 (홈 히어로 그림과 같은 톤).
 * 카드가 여러 장이라 그라데이션 id 가 겹치지 않게 useId 로 접두어를 붙인다. 내용이 없는 장식이라 스크린리더에서 숨긴다.
 */
export default function StudyVisual({
  kind,
  className,
}: {
  kind: StudyVisualKind;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const glass = `${id}-glass`;
  const rim = `${id}-rim`;
  const node = `${id}-node`;
  const blur = `${id}-blur`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 240"
      className={cn("h-auto w-full overflow-visible", className)}
    >
      <defs>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#dfe8ff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#c4d2ff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#bcd0ff" />
          <stop offset="100%" stopColor="#d3c6ff" />
        </linearGradient>
        <radialGradient id={node} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#d4e0ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a9bfff" stopOpacity="0.9" />
        </radialGradient>
        <filter id={blur} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      {/* 뒤쪽 빛 */}
      <ellipse cx="124" cy="128" rx="88" ry="80" fill="#cddcff" filter={`url(#${blur})`} />

      {kind === "mobile" && (
        <g transform="rotate(-14 120 120)">
          <rect
            x="72"
            y="30"
            width="96"
            height="180"
            rx="24"
            fill={`url(#${glass})`}
            stroke={`url(#${rim})`}
            strokeWidth="1.5"
          />
          <rect x="81" y="44" width="78" height="152" rx="16" fill="#ffffff" fillOpacity="0.5" />
          <rect x="104" y="36" width="32" height="5" rx="2.5" fill="#c3d2f5" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={90 + col * 22}
                y={58 + row * 24}
                width="16"
                height="16"
                rx="5"
                fill={(row + col) % 2 === 0 ? "#a9c2ff" : "#cbbcff"}
                fillOpacity={0.55 + row * 0.1}
              />
            )),
          )}
          <rect x="90" y="140" width="60" height="38" rx="10" fill="#4285f4" fillOpacity="0.16" />
          <path
            d="M79 58V174"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      )}

      {kind === "ai" && (
        <g>
          {(
            [
              [58, 92, 120, 118],
              [110, 50, 120, 118],
              [176, 78, 120, 118],
              [156, 160, 120, 118],
              [82, 172, 120, 118],
              [58, 92, 110, 50],
              [110, 50, 176, 78],
              [176, 78, 156, 160],
              [156, 160, 82, 172],
              [82, 172, 58, 92],
            ] as const
          ).map(([x1, y1, x2, y2]) => (
            <line
              key={`${x1}${y1}${x2}${y2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9fb6f5"
              strokeOpacity="0.7"
              strokeWidth="1.5"
            />
          ))}
          {(
            [
              [58, 92, 15],
              [110, 50, 12],
              [176, 78, 17],
              [156, 160, 14],
              [82, 172, 16],
              [120, 118, 28],
            ] as const
          ).map(([cx, cy, r]) => (
            <circle
              key={`${cx}${cy}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={`url(#${node})`}
              stroke={`url(#${rim})`}
              strokeWidth="1.2"
            />
          ))}
          <circle cx="110" cy="50" r="4" fill="#4285f4" />
          <circle cx="176" cy="78" r="4" fill="#ea4335" />
          <circle cx="156" cy="160" r="4" fill="#fbbc04" />
          <circle cx="82" cy="172" r="4" fill="#34a853" />
        </g>
      )}

      {kind === "web" && (
        <g>
          <rect
            x="58"
            y="44"
            width="150"
            height="110"
            rx="18"
            fill="#e9e3ff"
            fillOpacity="0.6"
            stroke={`url(#${rim})`}
          />
          <rect
            x="32"
            y="78"
            width="170"
            height="124"
            rx="20"
            fill={`url(#${glass})`}
            stroke={`url(#${rim})`}
            strokeWidth="1.5"
          />
          <circle cx="52" cy="98" r="4.5" fill="#ea4335" fillOpacity="0.8" />
          <circle cx="66" cy="98" r="4.5" fill="#fbbc04" fillOpacity="0.8" />
          <circle cx="80" cy="98" r="4.5" fill="#34a853" fillOpacity="0.8" />
          <path
            d="M96 134l-18 16 18 16M138 134l18 16-18 16M126 126l-18 48"
            fill="none"
            stroke="#4285f4"
            strokeOpacity="0.7"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {kind === "server" && (
        <g>
          {[146, 108, 70].map((y) => (
            <g key={y}>
              <path
                d={`M52 ${y}v26a68 20 0 0 0 136 0v-26`}
                fill={`url(#${glass})`}
                stroke={`url(#${rim})`}
                strokeWidth="1.5"
              />
              <ellipse
                cx="120"
                cy={y}
                rx="68"
                ry="20"
                fill="#ffffff"
                fillOpacity="0.8"
                stroke={`url(#${rim})`}
                strokeWidth="1.5"
              />
              <circle cx="166" cy={y + 30} r="3.5" fill="#34a853" fillOpacity="0.85" />
            </g>
          ))}
        </g>
      )}

      {kind === "default" && (
        <g>
          <circle
            cx="120"
            cy="120"
            r="66"
            fill={`url(#${node})`}
            stroke={`url(#${rim})`}
            strokeWidth="1.5"
          />
          <ellipse
            cx="120"
            cy="128"
            rx="104"
            ry="30"
            fill="none"
            stroke="#9fb6f5"
            strokeOpacity="0.75"
            strokeWidth="1.5"
            transform="rotate(-16 120 128)"
          />
          <circle cx="36" cy="150" r="5" fill="#4285f4" />
          <circle cx="94" cy="166" r="4" fill="#ea4335" />
          <circle cx="160" cy="146" r="4.5" fill="#fbbc04" />
          <circle cx="206" cy="102" r="3.5" fill="#34a853" />
        </g>
      )}
    </svg>
  );
}
