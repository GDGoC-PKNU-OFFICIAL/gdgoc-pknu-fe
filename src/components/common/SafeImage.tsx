"use client";

import { useState } from "react";

import Image, { type ImageProps } from "next/image";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  /** 원본 주소 (R2 공개 URL). 없으면 바로 기본 이미지를 쓴다 */
  src?: string | null;
  /** public/ 의 기본 이미지 경로 — R2 장애와 무관하게 항상 뜬다 (PRD 4-4) */
  fallbackSrc: string;
};

/**
 * 기본 이미지 대체가 내장된 next/image (C-11).
 * 이미지가 없거나 로드에 실패하면 fallbackSrc 로 바꾼다 — 깨진 이미지 아이콘을 노출하지 않는다 (PRD 3-6).
 *
 * 실패한 주소를 기억해 두는 방식이라, 같은 컴포넌트에 다른 src 가 들어오면 다시 원본부터 시도한다.
 */
export default function SafeImage({ src, fallbackSrc, alt, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = src && src !== failedSrc ? src : fallbackSrc;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) setFailedSrc(resolvedSrc);
      }}
    />
  );
}
