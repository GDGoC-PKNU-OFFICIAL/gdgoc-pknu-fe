import type { CSSProperties } from "react";

/**
 * 틀(object-fit: cover)에 맞춰 그린 사진에서 "보일 곳"과 "확대 배율"을 CSS 로 바꾼다.
 * 공개 카드(ActivityPoster)와 관리자 위치 고르기(ImagePositionField)가 같은 식을 써서 두 화면이 똑같이 보인다.
 *
 * - position: "가로% 세로%" = object-position. 사진의 그 지점이 틀의 같은 % 지점에 온다.
 * - zoom: 100~300 (%). 같은 지점을 기준점(transform-origin)으로 키운다 → 기준점은 제자리에 있고
 *   틀은 늘 사진으로 꽉 찬다 (기준점이 틀 안에 있으니 키워도 가장자리가 비지 않는다).
 */
export function framedImageStyle(
  position: string | undefined,
  zoom: number | undefined,
  fallbackPosition = "50% 50%",
): CSSProperties {
  const at = position || fallbackPosition;
  const scale = zoom && zoom > 100 ? zoom / 100 : 1;
  return scale === 1
    ? { objectPosition: at }
    : { objectPosition: at, transform: `scale(${scale})`, transformOrigin: at };
}
