// src/hooks/use-carousel.ts
// 가로 스크롤 트랙의 화살표 버튼 상태 · 이동 (C-12, IA 5-4).
// - 화살표는 "한 번에 보이는 카드 수만큼" 이동한다 → 트랙의 보이는 폭(clientWidth)만큼 스크롤하고,
//   멈출 위치는 CSS scroll-snap 이 카드 경계로 맞춘다.
// - 맨 앞 / 맨 끝이면 해당 방향을 비활성, 넘치지 않으면(카드가 한 화면 이하) 버튼을 숨길 수 있게 알려 준다.

import { useCallback, useEffect, useRef, useState } from "react";

/** 소수점 스크롤 값(고배율 화면) 때문에 끝에 닿아도 1px 이하로 남는 경우를 흡수한다 */
const EDGE_TOLERANCE_PX = 1;

interface ScrollEdges {
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

export function useCarousel<T extends HTMLElement>() {
  const trackRef = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>({ canScrollPrev: false, canScrollNext: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const canScrollPrev = track.scrollLeft > EDGE_TOLERANCE_PX;
      const canScrollNext = track.scrollLeft < maxScrollLeft - EDGE_TOLERANCE_PX;
      // 스크롤 이벤트마다 불리므로 값이 바뀔 때만 다시 그린다
      setEdges((prev) =>
        prev.canScrollPrev === canScrollPrev && prev.canScrollNext === canScrollNext
          ? prev
          : { canScrollPrev, canScrollNext },
      );
    };

    // ResizeObserver 는 observe 직후 한 번 호출되므로 첫 측정도 여기서 된다
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, []);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return {
    trackRef,
    ...edges,
    hasOverflow: edges.canScrollPrev || edges.canScrollNext,
    scrollByPage,
  };
}
