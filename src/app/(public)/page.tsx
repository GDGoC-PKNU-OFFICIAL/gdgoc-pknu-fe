import Image from "next/image";

import { type Metadata } from "next";

import BouncyTitle, { introEnd } from "@/components/common/BouncyTitle";
import GooglyEyes from "@/components/common/GooglyEyes";
import HeroDoodles from "@/components/common/HeroDoodles";
import PageSection, {
  FULL_SCREEN_SECTION,
  SECTION_CONTAINER,
} from "@/components/common/PageSection";
import SectionDivider from "@/components/common/SectionDivider";
import SectionHeader from "@/components/common/SectionHeader";
import { ACTIVITIES } from "@/data/about";
import { SCHEDULE_SECTION } from "@/data/events";
import {
  HERO,
  HOME_EVENT_LIMIT,
  HOME_LIST_LIMIT,
  HOME_SECTIONS,
  HOME_ACTIVITY_TITLES,
  HOME_STUDY_LIMIT,
} from "@/data/home";
import { CURRENT_PROJECTS } from "@/data/projects";
import { SITE } from "@/data/site";
import { CURRENT_STUDIES } from "@/data/studies";
import EventTimeline from "@/features/events/components/EventTimeline";
import { upcomingEvents } from "@/features/events/lib/filter-upcoming";
import ProjectShowcaseGrid from "@/features/projects/components/ProjectShowcaseGrid";
import RecruitBanner from "@/features/settings/components/RecruitBanner";
import StatsGrid from "@/features/settings/components/StatsGrid";
import StudyShowcase from "@/features/studies/components/StudyShowcase";
import { getEvents, getProjects, getSettings, getStudies } from "@/lib/api/public-api";
import { cn } from "@/lib/cn";
import { splitByStatus } from "@/lib/split-by-status";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// P-00 홈 (IA 4장). 섹션 헤더에 배지를 두지 않는다 (영문 타이틀만). 여러 도메인이 섞이는 화면이라 app 에서 조합한다 (FRONT_ARCHITECTURE § 2 원칙 2).
// 공개 API 는 정렬된 순서로 주므로 앞에서 잘라 쓴다. 다가오는 일정의 "오늘"은 ISR 시점 값이다 (lib/date.ts 주의문).
export default async function HomePage() {
  const [settings, projects, studies, events] = await Promise.all([
    getSettings(),
    getProjects(),
    getStudies(),
    getEvents(),
  ]);

  const currentProjects = splitByStatus(projects).current.slice(0, HOME_LIST_LIMIT);
  const currentStudies = splitByStatus(studies).current.slice(0, HOME_STUDY_LIMIT);
  const nextEvents = upcomingEvents(events, { limit: HOME_EVENT_LIMIT });

  // 히어로 제목: 큰 글자 "GDGoC" + 배지 "PKNU". 제목 등장이 끝나는 시각에 배지 · 눈 · 도형을 잇따라 띄운다
  const HERO_WORD = "GDGoC";
  const TITLE_DONE = introEnd(HERO_WORD);

  // 한 화면에 섹션 하나씩 (FULL_SCREEN_SECTION). data-scroll-snap 이 이 페이지에서만 스크롤 스냅을 켠다
  return (
    <div data-scroll-snap>
      {/* 1. 히어로 — 단체 사진을 화면 가득 깔고, 선글라스 낀 듯 어둡게 톤을 눌러 그 위에 흰 글자를 올린다 */}
      <section className="relative isolate overflow-hidden bg-[#0b0f17] md:snap-start">
        <Image
          src={HERO.photo.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[50%_45%] saturate-[0.85] motion-safe:animate-hero-zoom"
        />
        {/* 선글라스 렌즈: 푸른빛 도는 어두운 막 + 가장자리를 더 어둡게(비네팅) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[#0b1220]/60 bg-[radial-gradient(ellipse_at_center,rgba(11,18,32,0)_30%,rgba(11,18,32,0.55)_100%)]"
        />
        {/* 제목 둘레에 떠 있는 알록달록한 도형 (태블릿 · 데스크톱) */}
        <HeroDoodles
          start={TITLE_DONE - 0.2}
          className="absolute inset-0 -z-10 hidden opacity-90 md:block"
        />
        {/*
          사진 위라 라이트 · 다크 상관없이 어두운 테마 토큰으로 그린다 (data-theme="dark").
          글은 가운데 정렬. 아래 여백을 더 줘서 화면 가운데보다 조금 위에 둔다
        */}
        <div
          data-theme="dark"
          className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-4 py-28 text-center text-ink md:min-h-[calc(100svh-4rem)] md:px-8 md:pt-16 md:pb-40"
        >
          <div
            className="motion-safe:animate-fade-up"
            style={{ animationDelay: `${(TITLE_DONE - 0.2).toFixed(2)}s` }}
          >
            <RecruitBanner
              recruiting={settings.recruiting}
              recruitPeriod={settings.recruitPeriod}
            />
          </div>
          <div className="flex flex-col items-center gap-4 [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
            <p
              className="text-base font-medium text-white/85 motion-safe:animate-fade-up md:text-lg"
              style={{ animationDelay: "0.1s" }}
            >
              {HERO.affiliation}
            </p>
            {/*
              가운데 G 가 먼저 떠오르고, 나머지 글자가 그 자리에서 부드럽게 퍼져 나간다.
              "PKNU" 는 제목 오른쪽 아래에 기울어진 남색 알약 배지로(글자가 거의 자리 잡을 무렵 미끄러져 들어온다), 왼쪽 위에는 두리번거리는 눈을 얹는다
            */}
            <div className="relative mb-6 md:mb-10">
              <GooglyEyes
                delay={TITLE_DONE - 0.5}
                className="absolute -top-3 -left-6 size-12 -rotate-12 md:-top-5 md:-left-12 md:size-20"
              />
              <BouncyTitle
                text={HERO_WORD}
                label={HERO.title}
                originIndex={2} // 가운데 G 에서 나머지 글자가 튀어나온다
                className="font-display text-7xl font-bold tracking-tight text-white md:text-9xl lg:text-[10rem] lg:leading-none"
              >
                <span className="absolute -right-4 -bottom-7 rotate-[-7deg] md:-right-8 md:-bottom-10">
                  <span
                    className="inline-block rounded-full bg-[#1b2a5e] px-4 py-1 text-2xl font-bold tracking-wide text-white shadow-lg motion-safe:animate-pill-in md:px-6 md:text-4xl lg:text-5xl"
                    style={{ animationDelay: `${(TITLE_DONE - 0.7).toFixed(2)}s` }}
                  >
                    PKNU
                  </span>
                </span>
              </BouncyTitle>
            </div>
            <p
              className="max-w-2xl text-base break-keep whitespace-pre-line text-white/85 motion-safe:animate-fade-up md:text-lg"
              style={{ animationDelay: `${(TITLE_DONE - 0.5).toFixed(2)}s` }}
            >
              {SITE.description}
            </p>
          </div>
        </div>
      </section>

      {/* 2. 활동 통계 — 숫자가 주인공이라 헤더 · 설명을 가운데에 둔다 */}
      <section
        aria-labelledby="home-stats-title"
        className={cn(SECTION_CONTAINER, FULL_SCREEN_SECTION, "gap-12")}
      >
        <SectionHeader
          align="center"
          variant="home"
          title={HOME_SECTIONS.stats.title}
          titleId="home-stats-title"
        />
        <StatsGrid stats={settings.stats} />
      </section>

      <SectionDivider />

      {/* 3. About 요약 */}
      <PageSection
        fullScreen
        titleVariant="home"
        id="home-about"
        title={HOME_SECTIONS.about.title}
        link={HOME_SECTIONS.about.link}
      >
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {/* 홈에서는 HOME_ACTIVITY_TITLES 의 활동 4개만 한 줄로 (모바일 · 태블릿은 2개씩 두 줄 — 모바일은 비율 그대로 작게). 전체 6개는 About 에서 본다.
              카드 위쪽에 활동 그림(4:3, 양옆을 살짝 잘라 세로로 넉넉하게), 아래에 제목 · 설명. 주기(격주 등)는 홈에서 보여 주지 않는다.
              마우스를 올리면 4px 떠오르고 그림자가 짙어진다 ("모션 줄이기"면 그림자만) */}
          {HOME_ACTIVITY_TITLES.flatMap((name) =>
            ACTIVITIES.items.filter((item) => item.title === name),
          ).map(({ title, description, image }) => (
            <li
              key={title}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_14px_28px_-10px_rgba(40,70,140,0.22)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_36px_-12px_rgba(40,70,140,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.7)] dark:hover:shadow-[0_22px_36px_-12px_rgba(0,0,0,0.8)]"
            >
              {image && (
                // 흰 바탕 그림이라 다크 모드에서는 살짝 어둡게 눌러 눈부시지 않게 한다
                <Image
                  src={image}
                  alt=""
                  width={800}
                  height={520}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="aspect-[4/3] w-full border-b border-line bg-white object-cover dark:brightness-90"
                />
              )}
              <div className="flex flex-col gap-1 px-3 py-3 md:gap-1.5 md:px-5 md:py-4">
                <h3 className="text-sm font-semibold break-keep md:text-base">{title}</h3>
                <p className="line-clamp-3 text-xs break-keep text-ink-muted md:line-clamp-none md:text-sm">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <SectionDivider />

      {/* 4. 진행 중 프로젝트 — 마우스를 올리면 카드 안에서 상세 정보가 보이고, 누르면 /projects 상세로 간다 */}
      <PageSection
        fullScreen
        titleVariant="home"
        id="home-projects"
        title={HOME_SECTIONS.projects.title}
        link={HOME_SECTIONS.projects.link}
      >
        <ProjectShowcaseGrid projects={currentProjects} emptyMessage={CURRENT_PROJECTS.empty} />
      </PageSection>

      <SectionDivider />

      {/* 5. 진행 중 스터디 — 다른 섹션처럼 왼쪽 제목 · 오른쪽 자세히 보기 */}
      <section
        aria-labelledby="home-studies-title"
        className={cn("md:flex md:flex-col", FULL_SCREEN_SECTION)}
      >
        <div className={cn(SECTION_CONTAINER, "w-full gap-12")}>
          <SectionHeader
            variant="home"
            title={HOME_SECTIONS.studies.title}
            titleId="home-studies-title"
            link={{
              label: HOME_SECTIONS.studies.culture.linkLabel,
              href: HOME_SECTIONS.studies.culture.href,
            }}
          />
          <StudyShowcase studies={currentStudies} emptyMessage={CURRENT_STUDIES.empty} />
        </div>
      </section>

      <SectionDivider />

      {/* 6. 다가오는 일정 — 가까운 순 타임라인 (데스크톱 가로 · 모바일 세로) */}
      <PageSection
        fullScreen
        titleVariant="home"
        id="home-events"
        title={HOME_SECTIONS.events.title}
        link={HOME_SECTIONS.events.link}
      >
        <EventTimeline events={nextEvents} emptyMessage={SCHEDULE_SECTION.upcomingEmpty} />
      </PageSection>
    </div>
  );
}
