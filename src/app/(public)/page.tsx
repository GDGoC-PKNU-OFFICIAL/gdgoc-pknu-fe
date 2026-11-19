import Image from "next/image";

import { type Metadata } from "next";

import BouncyTitle from "@/components/common/BouncyTitle";
import HeroVisual from "@/components/common/HeroVisual";
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

  // 한 화면에 섹션 하나씩 (FULL_SCREEN_SECTION). data-scroll-snap 이 이 페이지에서만 스크롤 스냅을 켠다
  return (
    <div data-scroll-snap>
      {/* 1. 히어로 */}
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(105deg,#ffffff_38%,#eff4ff_72%,#f2eeff_100%)] md:snap-start dark:bg-[linear-gradient(105deg,#101318_38%,#121c33_72%,#191b36_100%)]">
        {/* 하단의 은은한 곡선 빛 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-10%] -bottom-56 h-96 rounded-[100%] bg-[#dfe8ff] opacity-70 blur-3xl dark:bg-[#1e3a78] dark:opacity-40"
        />
        {/* 행성 그림은 글 뒤 가운데에 은은한 배경으로 깐다 */}
        <HeroVisual className="pointer-events-none absolute top-1/2 left-1/2 w-[min(56rem,140vw)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-45 dark:opacity-30" />
        {/* 글은 가운데 정렬. 아래 여백을 더 줘서 화면 가운데보다 조금 위에 둔다 */}
        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-4 py-24 text-center md:min-h-[calc(100svh-4rem)] md:px-8 md:pt-16 md:pb-56">
          <RecruitBanner recruiting={settings.recruiting} recruitPeriod={settings.recruitPeriod} />
          <div className="flex flex-col items-center gap-4">
            <p className="text-base font-medium text-ink-muted md:text-lg">{HERO.affiliation}</p>
            {/* 글자가 하나씩 떨어져 통통 튀고, 마지막에 소문자 o 가 폴짝 뛴다 */}
            <BouncyTitle
              text={HERO.title}
              hopIndex={HERO.title.indexOf("o")}
              className="font-display text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl"
            />
            <p className="max-w-2xl text-base break-keep whitespace-pre-line text-ink-muted md:text-lg">
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
        <ul className="grid gap-4 md:grid-cols-3">
          {/* 활동 6개를 3개씩 두 줄로. 카드 위쪽에 활동 그림, 아래에 제목 · 설명. 주기(격주 등)는 홈에서 보여 주지 않는다.
              마우스를 올리면 4px 떠오르고 그림자가 짙어진다 ("모션 줄이기"면 그림자만) */}
          {ACTIVITIES.items.map(({ title, description, image }) => (
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
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[40/26] w-full border-b border-line bg-white object-cover dark:brightness-90"
                />
              )}
              <div className="flex flex-col gap-2 p-5">
                <h3 className="font-semibold break-keep">{title}</h3>
                <p className="text-sm break-keep text-ink-muted">{description}</p>
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
