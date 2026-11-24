/**
 * 슬라이드 좌우 화살표 보이기 (CardSlider · CardPager · EmblaSlider 공통).
 * 슬라이드 영역(group/slider)에 마우스를 올리거나 그 안에 키보드 포커스가 있을 때만 나타난다.
 * 마우스가 없는 기기(태블릿 터치 등)는 hover 가 없으므로 늘 보인다.
 * 맨 앞 · 맨 끝이라 누를 수 없는 화살표는 hover 중에도 숨긴다 (invisible — opacity 와 겹치지 않게).
 */
export const SLIDER_ARROW_VISIBILITY =
  "opacity-0 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100 [@media(hover:none)]:opacity-100 disabled:invisible";
