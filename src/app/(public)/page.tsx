import { Suspense } from "react";

import { type Metadata } from "next";

import HeroVisual from "@/components/common/HeroVisual";
import ManifestoSection from "@/components/common/ManifestoSection";
import PageSection, {
  FULL_SCREEN_SECTION,
  SECTION_CONTAINER,
} from "@/components/common/PageSection";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ACTIVITIES } from "@/data/about";
import { SCHEDULE_SECTION } from "@/data/events";
import { HERO, HOME_LIST_LIMIT, HOME_SECTIONS, HOME_STUDY_LIMIT } from "@/data/home";
import { CORE_MEMBERS } from "@/data/members";
import { CURRENT_PROJECTS } from "@/data/projects";
import { SITE } from "@/data/site";
import { CURRENT_STUDIES } from "@/data/studies";
import UpcomingEventList from "@/features/events/components/UpcomingEventList";
import { upcomingEvents } from "@/features/events/lib/filter-upcoming";
import MemberGrid from "@/features/members/components/MemberGrid";
import { groupMembers } from "@/features/members/lib/sort-members";
import CurrentProjectGrid from "@/features/projects/components/CurrentProjectGrid";
import ProjectDetailController from "@/features/projects/components/ProjectDetailController";
import RecruitBanner from "@/features/settings/components/RecruitBanner";
import StatsGrid from "@/features/settings/components/StatsGrid";
import StudyShowcase from "@/features/studies/components/StudyShowcase";
import { getEvents, getMembers, getProjects, getSettings, getStudies } from "@/lib/api/public-api";
import { cn } from "@/lib/cn";
import { splitByStatus } from "@/lib/split-by-status";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// P-00 홈 (IA 4장). 여러 도메인이 섞이는 화면이라 app 에서 조합한다 (FRONT_ARCHITECTURE § 2 원칙 2).
// 공개 API 는 정렬된 순서로 주므로 앞에서 잘라 쓴다. 다가오는 일정의 "오늘"은 ISR 시점 값이다 (lib/date.ts 주의문).
export default async function HomePage() {
  const [settings, projects, studies, events, members] = await Promise.all([
    getSettings(),
    getProjects(),
    getStudies(),
    getEvents(),
    getMembers(),
  ]);

  const currentProjects = splitByStatus(projects).current.slice(0, HOME_LIST_LIMIT);
  const currentStudies = splitByStatus(studies).current.slice(0, HOME_STUDY_LIMIT);
  const nextEvents = upcomingEvents(events, { limit: HOME_LIST_LIMIT });
  const { core } = groupMembers(members);

  // 한 화면에 섹션 하나씩 (FULL_SCREEN_SECTION). data-scroll-snap 이 이 페이지에서만 스크롤 스냅을 켠다
  return (
    <div data-scroll-snap>
      {/* 1. 히어로 */}
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(105deg,#ffffff_38%,#eff4ff_72%,#f2eeff_100%)] md:snap-start">
        {/* 하단의 은은한 곡선 빛 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-10%] -bottom-56 h-96 rounded-[100%] bg-[#dfe8ff] opacity-70 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl content-center items-center gap-8 px-4 py-16 md:min-h-[calc(100svh-4rem)] md:px-8 lg:grid-cols-[48fr_52fr]">
          <div className="flex flex-col gap-8">
            <RecruitBanner
              recruiting={settings.recruiting}
              recruitPeriod={settings.recruitPeriod}
            />
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-ink-muted">{SITE.affiliation}</p>
              <h1 className="text-4xl font-bold tracking-tight break-keep md:text-6xl">
                {HERO.title}
              </h1>
              <p className="max-w-2xl text-base break-keep text-ink-muted md:text-lg">
                {SITE.description}
              </p>
            </div>
          </div>
          <HeroVisual className="mx-auto max-w-sm lg:max-w-none" />
        </div>
      </section>

      {/* 2. 활동 통계 — 숫자가 주인공이라 헤더 · 설명을 가운데에 둔다 */}
      <section
        aria-labelledby="home-stats-title"
        className={cn(SECTION_CONTAINER, FULL_SCREEN_SECTION, "gap-12")}
      >
        <SectionHeader
          align="center"
          badge={HOME_SECTIONS.stats.badge}
          title={HOME_SECTIONS.stats.title}
          titleId="home-stats-title"
        />
        <StatsGrid stats={settings.stats} />
        <p className="text-center text-[15px] break-keep text-ink-muted">
          {HOME_SECTIONS.stats.caption}
        </p>
      </section>

      {/* 3. About 요약 */}
      <PageSection
        fullScreen
        id="home-about"
        badge={HOME_SECTIONS.about.badge}
        title={HOME_SECTIONS.about.title}
        link={HOME_SECTIONS.about.link}
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {ACTIVITIES.items.slice(0, HOME_LIST_LIMIT).map(({ title, cadence, description }) => (
            <li
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5"
            >
              <p className="text-xs font-medium text-brand-blue">{cadence}</p>
              <h3 className="font-semibold break-keep">{title}</h3>
              <p className="text-sm break-keep text-ink-muted">{description}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      {/* 4. 진행 중 프로젝트 */}
      <PageSection
        fullScreen
        id="home-projects"
        badge={HOME_SECTIONS.projects.badge}
        title={HOME_SECTIONS.projects.title}
        link={HOME_SECTIONS.projects.link}
      >
        <CurrentProjectGrid
          projects={currentProjects}
          emptyMessage={CURRENT_PROJECTS.empty}
          detailBasePath={PUBLIC_ROUTES.home}
        />
      </PageSection>

      {/* 5. 진행 중 스터디 — 큰 카드라 은은한 블루 · 라벤더 배경을 깔고 헤더를 가운데에 둔다 */}
      <section
        aria-labelledby="home-studies-title"
        className={cn("relative isolate overflow-hidden md:flex md:flex-col", FULL_SCREEN_SECTION)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f1f5ff_0%,#ffffff_42%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-48 -bottom-48 -z-10 size-160 rounded-full bg-[#ece6ff] opacity-60 blur-3xl"
        />
        <div className={cn(SECTION_CONTAINER, "w-full gap-12")}>
          <SectionHeader
            align="center"
            badge={HOME_SECTIONS.studies.badge}
            title={HOME_SECTIONS.studies.title}
            subtitle={HOME_SECTIONS.studies.subtitle}
            titleId="home-studies-title"
          />
          <StudyShowcase
            studies={currentStudies}
            emptyMessage={CURRENT_STUDIES.empty}
            culture={HOME_SECTIONS.studies.culture}
          />
        </div>
      </section>

      {/* 6. 다가오는 일정 */}
      <PageSection
        fullScreen
        id="home-events"
        badge={HOME_SECTIONS.events.badge}
        title={HOME_SECTIONS.events.title}
        link={HOME_SECTIONS.events.link}
      >
        <UpcomingEventList events={nextEvents} emptyMessage={SCHEDULE_SECTION.upcomingEmpty} />
      </PageSection>

      {/* 7. 코어멤버 */}
      <PageSection
        fullScreen
        id="home-members"
        badge={HOME_SECTIONS.members.badge}
        title={HOME_SECTIONS.members.title}
        link={HOME_SECTIONS.members.link}
      >
        <MemberGrid members={core} emptyMessage={CORE_MEMBERS.empty} />
      </PageSection>

      {/* 8. 약속 */}
      <ManifestoSection />

      {/* ↳ 상세 카드 (?project=) — 카드를 눌러도 홈을 떠나지 않는다 */}
      <Suspense fallback={null}>
        <ProjectDetailController projects={currentProjects} />
      </Suspense>
    </div>
  );
}
