import Image from "next/image";

import type { Activity } from "@/data/about";

interface ActivityCardProps {
  activity: Activity;
  /** next/image sizes — 한 줄 칸 수에 맞춘다 */
  sizes: string;
}

/**
 * 활동 카드 (홈 What We Do). 위쪽에 활동 그림(4:3), 아래에 제목 · 설명.
 * 모바일은 2열로 작게 그려 설명을 3줄까지만 보이고, md 이상은 전부 보인다.
 * 마우스를 올리면 4px 떠오르고 그림자가 짙어진다 ("모션 줄이기"면 그림자만).
 */
export default function ActivityCard({
  activity: { title, description, image },
  sizes,
}: ActivityCardProps) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_14px_28px_-10px_rgba(40,70,140,0.22)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_36px_-12px_rgba(40,70,140,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.7)] dark:hover:shadow-[0_22px_36px_-12px_rgba(0,0,0,0.8)]">
      {image && (
        // 흰 바탕 그림이라 다크 모드에서는 살짝 어둡게 눌러 눈부시지 않게 한다
        <Image
          src={image}
          alt=""
          width={800}
          height={520}
          sizes={sizes}
          className="aspect-[4/3] w-full border-b border-line bg-white object-cover dark:brightness-90"
        />
      )}
      <div className="flex flex-col gap-1 px-3 py-3 md:gap-1.5 md:px-5 md:py-4">
        <h3 className="text-sm font-semibold break-keep md:text-base">{title}</h3>
        <p className="line-clamp-3 text-xs break-keep text-ink-muted md:line-clamp-none md:text-sm">
          {description}
        </p>
      </div>
    </li>
  );
}
