import { Suspense } from "react";

import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import PromiseSection from "@/components/common/PromiseSection";
import SectionHeader from "@/components/common/SectionHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CURRENT_PROJECTS, PAST_PROJECTS, PROJECTS_HEADER } from "@/data/projects";
import CurrentProjectGrid from "@/features/projects/components/CurrentProjectGrid";
import PastProjectCarousel, {
  PastProjectCarouselView,
} from "@/features/projects/components/PastProjectCarousel";
import ProjectCard from "@/features/projects/components/ProjectCard";
import ProjectDetailController from "@/features/projects/components/ProjectDetailController";
import { groupProjectsByStartYear, latestYear } from "@/features/projects/lib/group-by-year";
import { getProjects } from "@/lib/api/public-api";
import { splitByStatus } from "@/lib/split-by-status";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Projects",
  description: "GDG on Campus PKNU의 진행 중인 프로젝트와 연도별 과거 프로젝트",
  // ?project= · ?pastYear= 가 붙은 주소도 목록 페이지를 대표 주소로 둔다 (IA 10-4)
  alternates: { canonical: PUBLIC_ROUTES.projects },
};

const CONTAINER = "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8";

// P-02 Projects (IA 4장). 서버 컴포넌트이고 searchParams 를 읽지 않는다 — 읽으면 동적 렌더링이 되어
// Render 콜드 스타트가 방문자에게 닿는다 (FRONT_ARCHITECTURE § 1 제약 3). 쿼리는 클라이언트 컴포넌트만 읽는다.
export default async function ProjectsPage() {
  const projects = await getProjects();
  const { current, past } = splitByStatus(projects);

  // 카드는 서버에서 그려 넘긴다 — ProjectCard 가 클라이언트 번들에 들어가지 않는다
  const pastGroups = groupProjectsByStartYear(past).map(({ year, items }) => ({
    year,
    items: items.map((project) => <ProjectCard key={project.id} project={project} />),
  }));

  return (
    <>
      <PageHeader title={PROJECTS_HEADER.title} description={PROJECTS_HEADER.description} />

      {/* 2. 현재 프로젝트 */}
      <section aria-labelledby="current-projects-title" className={CONTAINER}>
        <SectionHeader
          badge={CURRENT_PROJECTS.badge}
          title={CURRENT_PROJECTS.title}
          titleId="current-projects-title"
        />
        <CurrentProjectGrid projects={current} emptyMessage={CURRENT_PROJECTS.empty} />
      </section>

      {/* 3. 과거 프로젝트 — 서버 HTML 에는 최신 연도가 들어가고, 브라우저에서 ?pastYear= 를 반영한다 */}
      <section aria-labelledby="past-projects-title" className={CONTAINER}>
        <SectionHeader
          badge={PAST_PROJECTS.badge}
          title={PAST_PROJECTS.title}
          titleId="past-projects-title"
        />
        <Suspense
          fallback={
            <PastProjectCarouselView
              groups={pastGroups}
              selectedYear={latestYear(pastGroups)}
              emptyMessage={PAST_PROJECTS.empty}
            />
          }
        >
          <PastProjectCarousel groups={pastGroups} emptyMessage={PAST_PROJECTS.empty} />
        </Suspense>
      </section>

      {/* ↳ 상세 카드 (?project=) */}
      <Suspense fallback={null}>
        <ProjectDetailController projects={projects} />
      </Suspense>

      {/* 4. 약속 */}
      <PromiseSection page="projects" />
    </>
  );
}
