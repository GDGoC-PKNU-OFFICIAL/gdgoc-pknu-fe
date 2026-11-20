import Image from "next/image";

import type { Activity } from "@/data/about";
import { cn } from "@/lib/cn";

/** 카드 바탕 — 앨범 커버처럼 한 장씩 다른 색 그라데이션 + 장식 도형 */
interface PosterTheme {
  /** Tailwind 가 찾을 수 있도록 그라데이션 클래스를 통째로 적는다 */
  background: string;
  decor: "chevrons" | "circles" | "rings";
}

/** 순서대로 돌아가며 쓴다 (About What We Do 7장 기준으로 색이 겹치지 않게) */
const THEMES: PosterTheme[] = [
  { background: "bg-gradient-to-br from-[#5b8def] to-[#2a56c6]", decor: "chevrons" },
  { background: "bg-gradient-to-br from-[#43b968] to-[#1e8e3e]", decor: "circles" },
  { background: "bg-gradient-to-br from-[#f2756a] to-[#e0457b]", decor: "chevrons" },
  { background: "bg-gradient-to-br from-[#f6b53d] to-[#e37400]", decor: "rings" },
  { background: "bg-gradient-to-br from-[#3d5a99] to-[#1b2a5e]", decor: "circles" },
  { background: "bg-gradient-to-br from-[#80868b] to-[#3c4043]", decor: "rings" },
  { background: "bg-gradient-to-br from-[#a35ef0] to-[#6a1fb5]", decor: "chevrons" },
];

interface ActivityPosterProps {
  activity: Activity;
  /** 제목 위 작은 글씨 (예: "GDGoC PKNU 활동") */
  eyebrow: string;
  /** 색 · 도형을 고르는 순번 */
  index: number;
}

/**
 * 활동 포스터 카드 (About What We Do) — 음악 앱의 앨범 카드처럼 세로로 긴 색 카드.
 *   ┌──────────────┐
 *   │   ◢◤ 도형     │  ← 반투명 장식
 *   │ 무료 학습 콘텐츠 │  ← eyebrow
 *   │ 제목           │
 *   │ 설명 두 줄      │
 *   └──────────────┘
 * 글자는 모두 흰색이고, 아래쪽을 살짝 어둡게 깔아 밝은 색 카드에서도 읽힌다.
 * activity.photo 가 있으면 사진 카드 — 전체를 채우거나(cover) 위쪽 정사각형 + 아래 흐린 바탕(square),
 *   또는 글자 위쪽 자리만 사진으로 채운다(top),
 * activity.circles 가 있으면 큰 원 · 작은 원 사진을 액자처럼 얹고,
 * activity.artwork 가 있으면 색 카드 위쪽에 그 그림을 통째로 얹고,
 * activity.logo 면 색 카드 가운데에 GNB 와 같은 로고를 크게 얹는다.
 */
export default function ActivityPoster({ activity, eyebrow, index }: ActivityPosterProps) {
  const theme = THEMES[index % THEMES.length];

  return (
    <article
      className={cn(
        "relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[20px] p-5 text-white shadow-[0_18px_36px_-14px_rgba(16,24,40,0.35)] md:p-6",
        // 카드마다 정한 바탕(탁한 세로 그라데이션 등)이 있으면 그것, 없으면 순서대로 돌아가는 기본 색
        activity.background ?? theme.background,
      )}
    >
      {activity.photo && activity.photoLayout === "top" ? (
        // 사진 카드(top): 사진은 글자 위쪽에 남는 자리를 카드 가장자리까지 꽉 채우고, 글자는 그 아래 색 바탕에 둔다
        <div className="relative -mx-5 -mt-5 mb-4 min-h-0 flex-1 md:-mx-6 md:-mt-6">
          <Image
            src={activity.photo}
            alt=""
            fill
            sizes="(min-width: 1280px) 50vw, (min-width: 768px) 75vw, 130vw"
            className="object-cover"
            style={{ objectPosition: activity.photoPosition ?? "50% 50%" }}
            draggable={false}
          />
        </div>
      ) : activity.photo && activity.photoLayout !== "square" ? (
        // 사진 카드(cover): 사진을 꽉 채우고, 아래쪽을 더 진하게 깔아 흰 글자가 읽히게 한다
        <>
          <Image
            src={activity.photo}
            alt=""
            fill
            // 가로 사진(3:2)을 세로 카드(3:4)에 꽉 채우면 사진은 카드 폭의 2배로 그려진다 → 그만큼 큰 파일을 받게 한다
            sizes="(min-width: 1280px) 66vw, (min-width: 768px) 100vw, 170vw"
            className="-z-20 object-cover"
            style={{ objectPosition: activity.photoPosition ?? "50% 55%" }}
            draggable={false}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
          />
        </>
      ) : activity.photo ? (
        // 사진 카드(square): 위쪽은 카드 폭 그대로의 정사각형 사진, 그 아래 남는 자리는 같은 사진을 흐리게 깔아 채운다.
        // 정사각형 사진의 아래 끝은 흐린 바탕으로 자연스럽게 스며들게(mask) 하고, 글자 자리는 살짝 어둡게 깐다
        <>
          {/* 흐린 바탕 — 흐리게 그리므로 작은 파일이면 충분하다 */}
          <Image
            src={activity.photo}
            alt=""
            fill
            sizes="128px"
            className="-z-30 scale-125 object-cover blur-2xl saturate-150"
            draggable={false}
          />
          <div
            className="absolute inset-x-0 top-0 -z-20 aspect-square"
            style={{
              maskImage: "linear-gradient(to bottom, black 78%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent)",
            }}
          >
            <Image
              src={activity.photo}
              alt=""
              fill
              // 가로 사진(3:2)을 정사각형에 꽉 채우면 사진은 카드 폭의 1.5배로 그려진다 → 그만큼 큰 파일을 받게 한다
              sizes="(min-width: 1280px) 50vw, (min-width: 768px) 75vw, 130vw"
              className="object-cover"
              draggable={false}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/45 to-transparent"
          />
        </>
      ) : activity.circles ? (
        // 원형 액자 카드: 색 그라데이션 위에 큰 원 사진과, 그 오른쪽 아래에 겹치지 않게 떨어진 작은 원 사진
        // (위치 · 크기는 카드 폭 기준 %. 카드가 3:4 라 top % 는 높이 기준임에 주의)
        <>
          <CirclePhoto
            src={activity.circles[0]}
            className="top-[5%] left-[7%] w-[62%]"
            sizes="(min-width: 1280px) 21vw, (min-width: 768px) 31vw, 53vw"
          />
          <CirclePhoto
            src={activity.circles[1]}
            className="top-[37%] left-[63%] w-[30%]"
            sizes="(min-width: 1280px) 10vw, (min-width: 768px) 15vw, 26vw"
          />
        </>
      ) : activity.logo ? (
        // 로고 카드: GNB 와 같은 로고 — 심볼 이미지 + "GDGoC PKNU" 글자 (색 바탕이라 글자는 흰색).
        // 심볼 원본이 174×96 이라 2배 화면에서도 원본보다 작게 그려 선명하다
        <div className="flex min-h-0 flex-1 items-center justify-center gap-3 pb-4">
          <Image
            src="/logo/gdgoc-symbol.png"
            alt=""
            width={174}
            height={96}
            className="h-8 w-auto md:h-9"
            draggable={false}
          />
          <span className="text-xl font-semibold tracking-tight whitespace-nowrap md:text-2xl">
            GDGoC PKNU
          </span>
        </div>
      ) : activity.artwork ? (
        // 그림 카드: 색 카드 위쪽에 정사각형 그림을 얹는다 (음악 앱의 앨범 아트 카드처럼). 그림은 정사각형으로 잘라 둔다
        <div className="absolute inset-x-5 top-5 overflow-hidden rounded-xl bg-white shadow-lg md:inset-x-6 md:top-6">
          <Image
            src={activity.artwork}
            alt=""
            width={786}
            height={786}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 85vw"
            className="aspect-square h-auto w-full object-cover"
            draggable={false}
          />
        </div>
      ) : (
        <>
          <Decor kind={theme.decor} />
          {/* 아래쪽 글자 받침 */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/25 to-transparent"
          />
        </>
      )}

      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm text-white/75">{eyebrow}</p>
        <h3 className="text-lg font-bold tracking-tight break-keep md:text-xl">{activity.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed break-keep text-white/85">
          {activity.description}
        </p>
      </div>
    </article>
  );
}

/** 원형으로 자른 사진 (원형 액자 카드). 그림자 없이 색 바탕 위에 바로 얹는다 */
function CirclePhoto({ src, className, sizes }: { src: string; className: string; sizes: string }) {
  return (
    <div className={cn("absolute -z-10 aspect-square overflow-hidden rounded-full", className)}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" draggable={false} />
    </div>
  );
}

/** 반투명 흰 도형. 카드 크기에 맞춰 늘어나도록 viewBox 를 카드 비율(3:4)로 둔다 */
function Decor({ kind }: { kind: PosterTheme["decor"] }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 -z-20 size-full"
    >
      {kind === "chevrons" && (
        <g fill="#fff">
          <path d="M0 0 L300 200 L0 400 Z" opacity="0.10" />
          <path d="M0 40 L220 200 L0 360 Z" opacity="0.10" />
          <path d="M0 90 L140 200 L0 310 Z" opacity="0.12" />
        </g>
      )}
      {kind === "circles" && (
        <g fill="#fff">
          <circle cx="130" cy="120" r="95" opacity="0.14" />
          <circle cx="235" cy="215" r="55" opacity="0.12" />
          <circle cx="110" cy="250" r="45" opacity="0.10" />
        </g>
      )}
      {kind === "rings" && (
        <g fill="none" stroke="#fff">
          <circle cx="150" cy="150" r="120" strokeWidth="22" opacity="0.10" />
          <circle cx="150" cy="150" r="78" strokeWidth="18" opacity="0.12" />
          <circle cx="150" cy="150" r="38" strokeWidth="14" opacity="0.14" />
        </g>
      )}
    </svg>
  );
}
