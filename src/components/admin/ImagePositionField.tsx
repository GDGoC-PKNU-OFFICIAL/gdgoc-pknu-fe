"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { framedImageStyle } from "@/lib/image-frame";

import { FormFieldset } from "./FormField";

interface ImagePositionFieldProps {
  id: string;
  legend: string;
  /** 위치를 정할 사진 (업로드한 R2 주소 또는 /images/… 기본 그림) */
  src: string;
  /** "가로% 세로%" — 빈 값이면 defaultPosition 으로 보인다 */
  position: string;
  onPositionChange: (value: string) => void;
  /** 확대 배율 % (min~max). 확대를 받지 않는 칸(히어로)은 빼면 100% 고정 — 휠은 그대로 페이지를 스크롤한다 */
  zoom?: number;
  onZoomChange?: (value: number) => void;
  zoomRange?: { min: number; max: number; step: number };
  /** 공개 카드에서 사진이 보이는 칸의 비율 (CSS aspect-ratio, 예: "3 / 4") */
  aspect: string;
  /** 틀 모양 — 원형 사진은 동그랗게 보여 준다 */
  round?: boolean;
  /** 값이 비었을 때 공개 카드가 쓰는 위치 (ActivityPoster 기본값과 같게) */
  defaultPosition?: string;
  error?: string;
}

type Point = [number, number];

const NO_ZOOM = { min: 100, max: 100, step: 0 } as const;

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
const format = ([x, y]: Point) => `${x}% ${y}%`;

function parse(value: string): Point | null {
  const match = /^(\d{1,3})% (\d{1,3})%$/.exec(value.trim());
  return match ? [clamp(Number(match[1])), clamp(Number(match[2]))] : null;
}

/**
 * 사진에서 카드에 보일 부분 고르기 — 공개 카드와 같은 비율의 틀 안에서 사진을 끌어 옮기고, 슬라이더 · 휠로 키운다.
 * 틀 안의 그림은 공개 카드와 같은 식(lib/image-frame)으로 그려 보이는 그대로 저장된다.
 * 키보드: 틀에 포커스를 두고 방향키 1% (Shift 10%), +/- 로 확대 · 축소.
 *
 * 끈 거리를 % 로 바꾸는 법: object-fit: cover 는 사진을 틀보다 크게 그려 넘치는 만큼만 움직일 수 있다.
 *   확대까지 하면 넘치는 길이 = 그려진 사진 길이 × 배율 − 틀 길이, 그 길이의 0~100% 가 위치다.
 *   사진을 오른쪽으로 끌면 왼쪽이 더 보여야 하므로 % 는 줄어든다.
 *   (확대 기준점이 위치와 같아서 이 관계가 배율과 상관없이 그대로 성립한다)
 */
export default function ImagePositionField({
  id,
  legend,
  src,
  position: positionValue,
  onPositionChange,
  zoom = 100,
  onZoomChange = () => {},
  zoomRange = NO_ZOOM,
  aspect,
  round = false,
  defaultPosition = "50% 50%",
  error,
}: ImagePositionFieldProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; start: Point; overflow: Point } | null>(null);

  const position = parse(positionValue) ?? parse(defaultPosition) ?? [50, 50];
  const scale = zoom / 100;

  function readNaturalSize(img: HTMLImageElement) {
    const { naturalWidth: width, naturalHeight: height } = img;
    setNatural((prev) =>
      prev?.width === width && prev?.height === height ? prev : { width, height },
    );
  }

  /** 틀 크기 · 사진 원본 크기 · 배율로 가로 · 세로 넘치는 길이(px)를 구한다 */
  function overflow(): Point {
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame || !natural) return [0, 0];
    const fit = Math.max(frame.width / natural.width, frame.height / natural.height) * scale;
    return [natural.width * fit - frame.width, natural.height * fit - frame.height];
  }

  // 휠 · 핀치 이벤트는 렌더 사이에도 잇달아 오므로, 마지막으로 정한 배율을 ref 에 바로 적어 두고 그 값에서 이어 간다
  const liveZoom = useRef(zoom);
  useEffect(() => {
    liveZoom.current = zoom;
  }, [zoom]);

  function setZoom(next: number) {
    const clamped = Math.min(zoomRange.max, Math.max(zoomRange.min, Math.round(next)));
    if (clamped === liveZoom.current) return;
    liveZoom.current = clamped;
    onZoomChange(clamped);
  }
  const setZoomRef = useRef(setZoom);
  useEffect(() => {
    setZoomRef.current = setZoom;
  });

  // 휠로 확대 · 축소 (React 의 onWheel 은 passive 라 페이지 스크롤을 막을 수 없어 직접 붙인다)
  // - 마우스 휠: 한 칸(보통 deltaY 100)에 약 15%
  // - 노트북 터치패드 두 손가락 오므리기 · 벌리기: 브라우저가 ctrlKey 가 켜진 작은 휠로 보낸다 → 손가락 움직임만큼 부드럽게
  // - 터치패드 두 손가락 스크롤(ctrlKey 없음, 작은 값): 확대하지 않고 페이지를 그대로 스크롤한다
  const canZoom = zoomRange.max > zoomRange.min;
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !canZoom) return;
    const onWheel = (event: WheelEvent) => {
      const pinch = event.ctrlKey;
      const mouseWheel =
        event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
        (event.deltaX === 0 && Math.abs(event.deltaY) >= 50);
      if (!pinch && !mouseWheel) return;
      event.preventDefault();
      const deltaY =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 33 : event.deltaY;
      setZoomRef.current(liveZoom.current * Math.exp(-deltaY * (pinch ? 0.01 : 0.0015)));
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [canZoom]);

  // 터치 화면: 손가락 하나는 끌기, 둘은 오므리기 · 벌리기로 확대
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const pointerDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      // 두 번째 손가락이 닿으면 끌기를 멈추고 확대로 바꾼다
      drag.current = null;
      pinch.current = { distance: pointerDistance(), zoom: liveZoom.current };
      return;
    }
    if (pointers.current.size > 2) return;
    drag.current = { x: event.clientX, y: event.clientY, start: position, overflow: overflow() };
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pinch.current && pointers.current.size === 2) {
      const distance = pointerDistance();
      if (pinch.current.distance > 0)
        setZoom((pinch.current.zoom * distance) / pinch.current.distance);
      return;
    }
    const state = drag.current;
    if (!state) return;
    // 넘치는 길이가 거의 없는 축은 움직일 수 없다 (그 방향으로는 사진이 틀에 꼭 맞는다)
    const next: Point = [
      state.overflow[0] > 1
        ? clamp(state.start[0] - ((event.clientX - state.x) / state.overflow[0]) * 100)
        : state.start[0],
      state.overflow[1] > 1
        ? clamp(state.start[1] - ((event.clientY - state.y) / state.overflow[1]) * 100)
        : state.start[1],
    ];
    if (next[0] !== position[0] || next[1] !== position[1]) onPositionChange(format(next));
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    // 손가락 하나를 떼면 확대를 끝낸다. 남은 손가락으로 바로 끌면 사진이 튀므로 끌기도 새로 시작하게 둔다
    if (pointers.current.size < 2) pinch.current = null;
    drag.current = null;
    if (pointers.current.size === 0) setDragging(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(zoom + zoomRange.step);
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      setZoom(zoom - zoomRange.step);
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    // 방향키는 "사진을 그 방향으로 민다" — 끌기와 같은 방향 감각
    const delta: Record<string, Point> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    onPositionChange(format([clamp(position[0] + move[0]), clamp(position[1] + move[1])]));
  }

  // 어느 쪽으로 움직일 수 있나 — 확대했으면 사방, 아니면 사진이 틀보다 긴 쪽만 (cover 는 한 축만 넘친다)
  const [aw, ah] = aspect.split("/").map((n) => Number(n.trim()));
  const imageRatio = natural ? natural.width / natural.height : null;
  const zoomed = zoom > zoomRange.min;
  const canX = zoomed || imageRatio === null || imageRatio > aw / ah + 0.01;
  const canY = zoomed || imageRatio === null || imageRatio < aw / ah - 0.01;
  const axisHint = canX && canY ? "상하좌우" : canX ? "좌우" : canY ? "위아래" : null;
  const lockedHint = canX ? "위아래" : "좌우";

  const isDefault = !positionValue && !zoomed;

  return (
    <FormFieldset
      id={id}
      legend={legend}
      hint={
        canZoom
          ? `끌어서 위치를 맞추고, 사진 위에서 마우스 휠 · 두 손가락 벌리기로 확대합니다.${
              axisHint === "상하좌우"
                ? ""
                : axisHint
                  ? ` 지금은 ${axisHint}로만 움직이고, 조금 키우면 ${lockedHint}로도 움직입니다.`
                  : " 지금은 사진이 틀에 꼭 맞아, 키우면 움직일 수 있습니다."
            }`
          : axisHint
            ? `사진을 끌어서 보일 곳을 맞춥니다 (${axisHint}).`
            : "사진이 틀에 꼭 맞아 옮길 곳이 없습니다."
      }
      error={error}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div
          ref={frameRef}
          role="slider"
          tabIndex={0}
          aria-label={`${legend} — 방향키로 옮기기${canZoom ? ", +/- 로 확대" : ""}`}
          aria-valuetext={`가로 ${position[0]}%, 세로 ${position[1]}%${canZoom ? `, 확대 ${zoom}%` : ""}`}
          aria-valuenow={position[0]}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onKeyDown={onKeyDown}
          style={{ aspectRatio: aspect }}
          className={cn(
            "relative w-40 touch-none overflow-hidden border border-line bg-surface-muted select-none",
            "focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none",
            round ? "rounded-full" : "rounded-lg",
            dragging ? "cursor-grabbing" : "cursor-grab",
            error && "border-brand-red",
          )}
        >
          {/* 위치 계산에 원본 크기가 필요하고, 끄는 동안 매 프레임 다시 그리므로 최적화 없이 그대로 띄운다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // 다른 사진이면 원본 크기를 새로 잰다
            key={src}
            src={src}
            alt=""
            draggable={false}
            // 캐시된 사진은 React 가 onLoad 를 붙이기 전에 다 읽혀 onLoad 가 오지 않는다 → 붙는 순간 한 번 더 확인한다
            ref={(img) => {
              if (img?.complete && img.naturalWidth > 0) readNaturalSize(img);
            }}
            onLoad={(event) => readNaturalSize(event.currentTarget)}
            className="pointer-events-none size-full object-cover"
            style={framedImageStyle(format(position), zoom)}
          />
          {/* 끄는 동안 3분할 안내선 */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity",
              dragging ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
            <span className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
            <span className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
            <span className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          {canZoom && (
            <span className="text-xs text-ink-muted">
              확대 <span className="font-semibold text-ink tabular-nums">{zoom}%</span>
            </span>
          )}
          <span className="text-xs text-ink-muted tabular-nums">
            {positionValue ? `위치 ${format(position)}` : "위치 기본"}
          </span>
          <div className="mt-1">
            <Button
              type="button"
              // 글자만 있으면 버튼인 줄 모른다 → 테두리 버튼 (이미지 변경과 같은 모양)
              variant="secondary"
              className="min-h-9 px-3"
              disabled={isDefault}
              onClick={() => {
                onPositionChange("");
                onZoomChange(zoomRange.min);
              }}
            >
              원래대로
            </Button>
          </div>
        </div>
      </div>
    </FormFieldset>
  );
}
