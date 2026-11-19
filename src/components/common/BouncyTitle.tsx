import { cn } from "@/lib/cn";

/** 글자 하나가 떨어지기 시작하는 간격 (초) */
const STAGGER = 0.08;
/** 첫 글자가 떨어지기 전 기다리는 시간 (초) */
const START = 0.2;
/** letter-drop 길이 (globals.css 와 같게) */
const DROP = 0.9;

/**
 * 글자가 하나씩 위에서 떨어져 통통 튀며 자리를 잡는 제목 (애니메이션 영화 오프닝 느낌).
 * 다 떨어지고 나면 hopIndex 번째 글자가 한 번 폴짝 뛴다. 서버 컴포넌트이고 CSS 애니메이션만 쓴다.
 *
 * - 화면 읽기 프로그램에는 글자 조각 대신 text 전체를 한 번 읽힌다 (aria-label).
 * - "모션 줄이기" 설정이면 움직이지 않고 처음부터 그대로 보인다 (motion-safe).
 * - 단어 안에서는 줄이 바뀌지 않고, 단어 사이에서만 바뀐다.
 */
export default function BouncyTitle({
  text,
  hopIndex,
  className,
}: {
  text: string;
  /** 마지막에 폴짝 뛰는 글자의 위치 (공백 포함 0부터). 없으면 뛰지 않는다 */
  hopIndex?: number;
  className?: string;
}) {
  const letters = [...text];
  const lastDropEnd = START + (letters.length - 1) * STAGGER + DROP;
  const words = text.split(" ");
  // 각 단어의 첫 글자가 text 안에서 몇 번째인지 (공백 포함)
  const wordStarts = words.map((_, w) =>
    words.slice(0, w).reduce((sum, prev) => sum + [...prev].length + 1, 0),
  );

  return (
    <h1 aria-label={text} className={className}>
      {words.map((word, wordIndex) => {
        const start = wordStarts[wordIndex];
        return (
          <span key={wordIndex} aria-hidden="true">
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((letter, i) => {
                const index = start + i;
                const hop = index === hopIndex;
                return (
                  // 바깥: 떨어지기, 안쪽: 폴짝 — transform 이 겹치지 않게 나눈다
                  <span
                    key={i}
                    className="inline-block origin-bottom motion-safe:animate-letter-drop"
                    style={{ animationDelay: `${(START + index * STAGGER).toFixed(2)}s` }}
                  >
                    <span
                      className={cn(
                        "inline-block origin-bottom",
                        hop && "motion-safe:animate-letter-hop",
                      )}
                      style={
                        hop ? { animationDelay: `${(lastDropEnd + 0.1).toFixed(2)}s` } : undefined
                      }
                    >
                      {letter}
                    </span>
                  </span>
                );
              })}
            </span>
          </span>
        );
      })}
    </h1>
  );
}
