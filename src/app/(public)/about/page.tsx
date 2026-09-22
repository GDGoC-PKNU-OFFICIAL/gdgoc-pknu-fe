import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import PromiseSection from "@/components/common/PromiseSection";
import SectionHeader from "@/components/common/SectionHeader";
import SocialIcon from "@/components/layout/SocialIcon";
import { buttonStyles } from "@/components/ui/Button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ABOUT_HEADER, ACTIVITIES, IDENTITY } from "@/data/about";
import { FAQ } from "@/data/faq";
import { RULES } from "@/data/rules";
import { DISCORD_INVITE_URL } from "@/data/social-links";

export const metadata: Metadata = {
  title: "About",
  description: "GDG on Campus PKNU의 활동 방식 · 동아리 강령 · 활동 규칙 · 자주 묻는 질문",
  alternates: { canonical: PUBLIC_ROUTES.about },
};

const CONTAINER = "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8";

// P-01 About (IA 4장). 전부 src/data 의 정적 콘텐츠라 API 호출이 없다.
// "지원 모집 중" 항목은 두지 않는다 — 모집 여부는 홈 히어로 배너로만 안내한다.
export default function AboutPage() {
  return (
    <>
      <PageHeader title={ABOUT_HEADER.title} description={ABOUT_HEADER.description} />

      {/* 2. 정체성 */}
      <section aria-labelledby="identity-title" className={CONTAINER}>
        <SectionHeader badge={IDENTITY.badge} title={IDENTITY.title} titleId="identity-title" />
        <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed break-keep md:text-lg">
          {IDENTITY.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 3. 활동 방식 */}
      <section aria-labelledby="activities-title" className={CONTAINER}>
        <SectionHeader
          badge={ACTIVITIES.badge}
          title={ACTIVITIES.title}
          titleId="activities-title"
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {ACTIVITIES.items.map((activity) => (
            <li
              key={activity.title}
              className="flex flex-col gap-2 rounded-2xl border border-line p-6"
            >
              <p className="text-sm font-semibold text-brand-blue">{activity.cadence}</p>
              <h3 className="text-lg font-semibold">{activity.title}</h3>
              <p className="text-sm break-keep text-ink-muted">{activity.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. 동아리 강령 (#code-of-conduct) — 약속 섹션 C-07 의 About 버전 */}
      <PromiseSection page="about" />

      {/* 5. 활동 규칙 */}
      <section aria-labelledby="rules-title" className={CONTAINER}>
        <SectionHeader badge={RULES.badge} title={RULES.title} titleId="rules-title" />
        <ul className="flex max-w-3xl list-disc flex-col gap-3 pl-5 break-keep marker:text-brand-blue">
          {RULES.items.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      {/* 6. FAQ — 네이티브 <details> 아코디언: JS 없이 키보드 · 스크린리더 지원 */}
      <section aria-labelledby="faq-title" className={CONTAINER}>
        <SectionHeader badge={FAQ.badge} title={FAQ.title} titleId="faq-title" />
        <div className="flex max-w-3xl flex-col divide-y divide-line border-y border-line">
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
      </section>

      {/* 7. Discord CTA */}
      <section aria-labelledby="discord-title" className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2
            id="discord-title"
            className="text-2xl font-bold tracking-tight break-keep md:text-3xl"
          >
            Discord 에서 소식을 가장 먼저 받아 보세요
          </h2>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ size: "lg" })}
          >
            <SocialIcon channel="discord" className="size-5" />
            Discord 참여하기
            <span className="sr-only">(새 탭에서 열림)</span>
          </a>
        </div>
      </section>
    </>
  );
}
