import Image from "next/image";

import { cn } from "@/lib/cn";

import { type StudyVisualKind } from "../lib/study-visual";

/**
 * 스터디 카드 오른쪽 장식 — 분야를 상징하는 Google Noto 이모지 (Apache License 2.0).
 * 파일은 public/emoji/{kind}.svg 이고 fonts.gstatic.com/s/e/notoemoji 에서 받았다.
 * 내용이 없는 장식이라 스크린리더에서 숨긴다 (alt="").
 */
export default function StudyVisual({
  kind,
  className,
}: {
  kind: StudyVisualKind;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      {/* 이모지 뒤 은은한 빛 */}
      <span
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full bg-[#cddcff] opacity-70 blur-2xl"
      />
      <Image
        src={`/emoji/${kind}.svg`}
        alt=""
        fill
        sizes="224px"
        unoptimized
        className="object-contain p-[14%] drop-shadow-[0_18px_24px_rgba(66,133,244,0.22)]"
      />
    </div>
  );
}
