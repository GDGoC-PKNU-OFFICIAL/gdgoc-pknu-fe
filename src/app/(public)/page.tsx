import Link from "next/link";

import { type Metadata } from "next";

import PageSection, { SECTION_CONTAINER } from "@/components/common/PageSection";
import PromiseSection from "@/components/common/PromiseSection";
import { buttonStyles } from "@/components/ui/Button";
import { ACTIVITIES } from "@/data/about";
import { SCHEDULE_SECTION } from "@/data/events";
import { HERO, HOME_LIST_LIMIT, HOME_SECTIONS } from "@/data/home";
import { CORE_MEMBERS } from "@/data/members";
import { CURRENT_PROJECTS } from "@/data/projects";
import { SITE } from "@/data/site";
import { CURRENT_STUDIES } from "@/data/studies";
import UpcomingEventList from "@/features/events/components/UpcomingEventList";
import { upcomingEvents } from "@/features/events/lib/filter-upcoming";
import MemberGrid from "@/features/members/components/MemberGrid";
import { groupMembers } from "@/features/members/lib/sort-members";
import CurrentProjectGrid from "@/features/projects/components/CurrentProjectGrid";
import RecruitBanner from "@/features/settings/components/RecruitBanner";
import StatsGrid from "@/features/settings/components/StatsGrid";
import StudyGrid from "@/features/studies/components/StudyGrid";
import { getEvents, getMembers, getProjects, getSettings, getStudies } from "@/lib/api/public-api";
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
  const currentStudies = splitByStatus(studies).current.slice(0, HOME_LIST_LIMIT);
  const nextEvents = upcomingEvents(events, { limit: HOME_LIST_LIMIT });
  const { core } = groupMembers(members);

  return (
    <>
      {/* 1. 히어로 */}
      <section className="border-b border-line bg-surface-muted">
        <div className={SECTION_CONTAINER}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-ink-muted">{SITE.affiliation}</p>
            <h1 className="text-4xl font-bold tracking-tight break-keep md:text-6xl">
              {HERO.title}
            </h1>
            <p className="max-w-2xl text-base break-keep text-ink-muted md:text-lg">
              {SITE.description}
            </p>
          </div>
          <RecruitBanner
            recruiting={settings.recruiting}
            bannerText={settings.bannerText}
            recruitPeriod={settings.recruitPeriod}
          />
          <div className="flex flex-wrap gap-3">
            <Link href={HERO.primaryCta.href} className={buttonStyles({ size: "lg" })}>
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              {HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 활동 통계 */}
      <PageSection
        id="home-stats"
        badge={HOME_SECTIONS.stats.badge}
        title={HOME_SECTIONS.stats.title}
      >
        <StatsGrid stats={settings.stats} />
      </PageSection>

      {/* 3. About 요약 */}
      <PageSection
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
        id="home-projects"
        badge={HOME_SECTIONS.projects.badge}
        title={HOME_SECTIONS.projects.title}
        link={HOME_SECTIONS.projects.link}
      >
        <CurrentProjectGrid projects={currentProjects} emptyMessage={CURRENT_PROJECTS.empty} />
      </PageSection>

      {/* 5. 진행 중 스터디 */}
      <PageSection
        id="home-studies"
        badge={HOME_SECTIONS.studies.badge}
        title={HOME_SECTIONS.studies.title}
        link={HOME_SECTIONS.studies.link}
      >
        <StudyGrid studies={currentStudies} emptyMessage={CURRENT_STUDIES.empty} />
      </PageSection>

      {/* 6. 다가오는 일정 */}
      <PageSection
        id="home-events"
        badge={HOME_SECTIONS.events.badge}
        title={HOME_SECTIONS.events.title}
        link={HOME_SECTIONS.events.link}
      >
        <UpcomingEventList events={nextEvents} emptyMessage={SCHEDULE_SECTION.upcomingEmpty} />
      </PageSection>

      {/* 7. 코어멤버 */}
      <PageSection
        id="home-members"
        badge={HOME_SECTIONS.members.badge}
        title={HOME_SECTIONS.members.title}
        link={HOME_SECTIONS.members.link}
      >
        <MemberGrid members={core} emptyMessage={CORE_MEMBERS.empty} />
      </PageSection>

      {/* 8. 약속 */}
      <PromiseSection page="home" />
    </>
  );
}
