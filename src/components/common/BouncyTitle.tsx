import { type CSSProperties, type ReactNode } from "react";

/** 씨앗 글자(점 → 글자)가 나타나기 시작하는 시각 (초) */
const SEED_START = 0.2;
/** letter-seed 길이 (globals.css 와 같게) */
const SEED = 1.1;
/** 첫 글자가 씨앗 글자에서 튀어나가는 시각 (초) */
const EJECT_START = 0.55;
/** 글자가 하나씩 튀어나가는 간격 (초) */
const EJECT_STAGGER = 0.07;
/** letter-eject 길이 (globals.css 와 같게) */
const EJECT = 1.2;
/** 이웃 글자 사이 거리 — 글자 평균 폭 (em) */
const LETTER_WIDTH_EM = 0.68;

/**
 * 모든 글자가 자리를 잡는 시각 (초) — 뒤따르는 장식(배지 · 도형)의 시작 시각을 맞출 때 쓴다.
 * 감속 곡선이라 끝 무렵에는 거의 멈춰 있으므로, 장식은 이보다 조금 일찍 시작해도 자연스럽다.
 */
export function introEnd(text: string) {
  const ejected = [...text].length - 1;
  return Math.max(SEED_START + SEED, EJECT_START + (ejected - 1) * EJECT_STAGGER + EJECT);
}

/**
 * 로고 애니메이션처럼 등장하는 제목 (레퍼런스 영상을 0.2초 단위로 쪼개 따라 했다).
 *
 * 1. 씨앗 글자(originIndex 번째)가 흐릿하게 떠오르며 먼저 자리 잡는다.
 * 2. 나머지 글자가 그 씨앗 글자 자리에서 하나씩 미끄러지듯 퍼져 나가 제자리에 선다.
 *    씨앗에 가까운 글자부터 나간다. 모두 한 번의 긴 감속 곡선(expo-out)이라 튀지 않고 부드럽다.
 *
 * 서버 컴포넌트이고 CSS 애니메이션만 쓴다.
 * - 화면 읽기 프로그램에는 글자 조각 대신 label(없으면 text) 전체를 한 번 읽힌다 (aria-label).
 * - "모션 줄이기" 설정이면 움직이지 않고 처음부터 그대로 보인다 (motion-safe).
 * - 한 단어(공백 없음) 제목을 전제로 한다.
 */
export default function BouncyTitle({
  text,
  originIndex,
  label,
  children,
  className,
}: {
  text: string;
  /** 처음 나타나 다른 글자를 뿜어내는 글자의 위치 (0부터). 없으면 가운데 글자 */
  originIndex?: number;
  /** 화면 읽기 프로그램이 읽을 제목. 없으면 text */
  label?: string;
  /** 글자 뒤에 덧붙이는 장식 (배지 등). 화면 읽기 프로그램에는 숨긴다 — label 에 담을 것 */
  children?: ReactNode;
  className?: string;
}) {
  const letters = [...text];
  const origin = originIndex ?? Math.floor((letters.length - 1) / 2);
  // 씨앗에 가까운 글자부터 튀어나간다 (거리가 같으면 오른쪽 먼저)
  const ejectOrder = letters
    .map((_, index) => index)
    .filter((index) => index !== origin)
    .sort((a, b) => Math.abs(a - origin) - Math.abs(b - origin) || b - a);

  return (
    <h1 aria-label={label ?? text} className={className}>
      <span aria-hidden="true" className="inline-block whitespace-nowrap">
        {letters.map((letter, index) => {
          if (index === origin) {
            return (
              <span
                key={index}
                className="relative z-10 inline-block origin-bottom motion-safe:animate-letter-seed"
                style={{ animationDelay: `${SEED_START}s` }}
              >
                {letter}
              </span>
            );
          }
          // 씨앗 글자 자리에서 출발: 제자리까지 거리만큼 반대로 옮겨 둔다
          const style = {
            "--eject-x": `${((origin - index) * LETTER_WIDTH_EM).toFixed(2)}em`,
            animationDelay: `${(EJECT_START + ejectOrder.indexOf(index) * EJECT_STAGGER).toFixed(2)}s`,
          } as CSSProperties;
          return (
            <span
              key={index}
              className="inline-block origin-bottom motion-safe:animate-letter-eject"
              style={style}
            >
              {letter}
            </span>
          );
        })}
      </span>
      {children && <span aria-hidden="true">{children}</span>}
    </h1>
  );
}
