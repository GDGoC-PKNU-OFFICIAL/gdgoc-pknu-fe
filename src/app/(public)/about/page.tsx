import { type CSSProperties, Suspense } from "react";

import { type Metadata } from "next";

import ActivityPoster from "@/components/common/ActivityPoster";
import EmblaSlider from "@/components/common/EmblaSlider";
import RevealOnScroll from "@/components/common/RevealOnScroll";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ABOUT_ACTIVITY_GROUPS, ABOUT_HEADER, ACTIVITIES, IDENTITY } from "@/data/about";
import { FAQ } from "@/data/faq";
import { RULES } from "@/data/rules";
import AboutCanvas from "@/features/about/components/AboutCanvas";
import RuleDetailController from "@/features/about/components/RuleDetailController";
import RuleDocBlock from "@/features/about/components/RuleDocBlock";

export const metadata: Metadata = {
  title: "About",
  description: "GDG on Campus PKNU의 활동 방식 · 활동 규칙 · 자주 묻는 질문",
  alternates: { canonical: PUBLIC_ROUTES.about },
};

const CONTAINER = "mx-auto flex max-w-site flex-col gap-8 px-4 py-16 md:px-8";

/**
 * 섹션 안 덩어리마다 붙인다 — 섹션이 화면에 들어오면 order 순서대로 흐림에서 선명하게 떠오른다
 * (머리말 제목 · 설명과 같은 효과, RevealOnScroll variant="blur")
 */
const reveal = (order: number) => ({
  "data-reveal-item": true,
  style: { "--reveal-order": order } as CSSProperties,
});

// P-01 About (IA 4장). 전부 src/data 의 정적 콘텐츠라 API 호출이 없다.
// "지원 모집 중" 항목은 두지 않는다 — 모집 여부는 홈 히어로 배너로만 안내한다.
/** What We Do 포스터 카드 목록 (묶음 순서대로, 묶음 이름이 카드 위 작은 글씨) */
function activityPosters() {
  return ABOUT_ACTIVITY_GROUPS.flatMap(({ eyebrow, titles }) =>
    titles.flatMap((name) =>
      ACTIVITIES.items
        .filter((item) => item.title === name)
        .map((activity) => ({ activity, eyebrow })),
    ),
  ).map(({ activity, eyebrow }, index) => (
    <ActivityPoster key={activity.title} activity={activity} eyebrow={eyebrow} index={index} />
  ));
}

// IA 4장 P-01 #7 Discord CTA 는 팀 결정으로 제외했다 — Discord 는 Footer 아이콘으로만 안내한다.
export default function AboutPage() {
  return (
    <>
      {/* 1. 머리말 + 본문 전체를 컬러 배경 위 흰 원형 영역에 담는다 (AboutCanvas) */}
      <AboutCanvas title={ABOUT_HEADER.title} description={ABOUT_HEADER.description}>
        {/* 2. 정체성 */}
        <section aria-labelledby="identity-title">
          <RevealOnScroll variant="blur" className={CONTAINER}>
            <div {...reveal(0)}>
              <SectionHeader title={IDENTITY.title} titleId="identity-title" variant="home" />
            </div>
            <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed break-keep md:text-lg">
              {IDENTITY.paragraphs.map((paragraph, index) => (
                <p key={paragraph} {...reveal(index + 1)}>
                  {paragraph}
                </p>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* 3. 활동 방식 */}
        <section aria-labelledby="activities-title">
          <RevealOnScroll variant="blur" className={CONTAINER}>
            <div {...reveal(0)}>
              <SectionHeader title={ACTIVITIES.title} titleId="activities-title" variant="home" />
            </div>
            {/* 앨범 카드처럼 세로로 긴 색 카드를 옆으로 넘긴다 (홈 활동 4개 + 무료 학습 콘텐츠 3개).
              끌기 · 관성 · 끝 저항 · 트랙패드 스와이프는 Embla 가 맡는다 */}
            <div {...reveal(1)}>
              <EmblaSlider label="What We Do 활동 목록">{activityPosters()}</EmblaSlider>
            </div>
          </RevealOnScroll>
        </section>

        {/* 4. 활동 규칙 — 규칙 문서 3개를 아이콘 블록으로 (모바일 한 줄에 하나, md 이상 세 개). 누르면 ?rule= 상세 카드 */}
        <section aria-labelledby="rules-title">
          <RevealOnScroll variant="blur" className={CONTAINER}>
            <div {...reveal(0)}>
              <SectionHeader title={RULES.title} titleId="rules-title" variant="home" />
            </div>
            <ul className="grid gap-3 md:grid-cols-3 md:gap-4" {...reveal(1)}>
              {RULES.items.map((doc) => (
                <RuleDocBlock key={doc.title} doc={doc} />
              ))}
            </ul>
          </RevealOnScroll>
        </section>

        {/* 5. FAQ — 네이티브 <details> 아코디언: JS 없이 키보드 · 스크린리더 지원 */}
        <section aria-labelledby="faq-title">
          <RevealOnScroll variant="blur" className={CONTAINER}>
            <div {...reveal(0)}>
              <SectionHeader title={FAQ.title} titleId="faq-title" variant="home" />
            </div>
            <div
              className="flex max-w-3xl flex-col divide-y divide-line border-y border-line"
              {...reveal(1)}
            >
              {FAQ.items.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium break-keep [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="text-xl text-ink-muted transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed break-keep text-ink-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </RevealOnScroll>
        </section>
      </AboutCanvas>

      {/* ↳ 활동 규칙 상세 카드 (?rule=) */}
      <Suspense fallback={null}>
        <RuleDetailController />
      </Suspense>
    </>
  );
}
