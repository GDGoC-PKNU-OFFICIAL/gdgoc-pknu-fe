import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import PromiseSection from "@/components/common/PromiseSection";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CURRENT_STUDIES, PAST_STUDIES, STUDIES_HEADER } from "@/data/studies";
import StudyGrid from "@/features/studies/components/StudyGrid";
import { getStudies } from "@/lib/api/public-api";
import { splitByStatus } from "@/lib/split-by-status";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Studies",
  description: "GDG on Campus PKNU의 진행 중인 스터디와 과거 스터디",
  alternates: { canonical: PUBLIC_ROUTES.studies },
};

// P-03 Studies (IA 4장). 연도 버튼 · 상세 카드 없이 그리드만 있다.
export default async function StudiesPage() {
  const { current, past } = splitByStatus(await getStudies());

  return (
    <>
      <PageHeader title={STUDIES_HEADER.title} description={STUDIES_HEADER.description} />

      <PageSection id="current-studies" badge={CURRENT_STUDIES.badge} title={CURRENT_STUDIES.title}>
        <StudyGrid studies={current} emptyMessage={CURRENT_STUDIES.empty} />
      </PageSection>

      <PageSection id="past-studies" badge={PAST_STUDIES.badge} title={PAST_STUDIES.title}>
        <StudyGrid studies={past} emptyMessage={PAST_STUDIES.empty} />
      </PageSection>

      <PromiseSection page="studies" />
    </>
  );
}
