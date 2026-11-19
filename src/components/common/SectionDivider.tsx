/**
 * 섹션 사이 주제 구분선 (홈). 본문 폭(max-w-6xl) · 좌우 여백에 맞춰 가로선 하나를 긋는다.
 * <hr> 이라 화면 읽기 프로그램에도 "주제가 바뀜"으로 전해진다.
 */
export default function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <hr className="border-line" />
    </div>
  );
}
