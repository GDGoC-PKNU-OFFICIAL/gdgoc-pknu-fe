export const MAIN_CONTENT_ID = "main-content";

/** 키보드 사용자가 GNB 를 건너뛰고 본문으로 가는 링크. Tab 첫 번째에서만 보인다. */
export default function SkipToContent() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only rounded-md bg-brand-blue px-4 py-3 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      본문으로 건너뛰기
    </a>
  );
}
