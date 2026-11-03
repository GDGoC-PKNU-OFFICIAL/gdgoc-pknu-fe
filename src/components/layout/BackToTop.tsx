"use client";

/** Footer "Back to top". 주소에 # 을 남기지 않고 맨 위로 올린다. "모션 줄이기"면 바로 이동한다 */
export default function BackToTop() {
  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold whitespace-nowrap text-white hover:text-[#8ab4f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Back to top
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 11 5-5 5 5M7 18l5-5 5 5" />
      </svg>
    </button>
  );
}
