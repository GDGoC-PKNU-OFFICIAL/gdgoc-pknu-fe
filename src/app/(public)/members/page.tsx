import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import PromiseSection from "@/components/common/PromiseSection";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CORE_MEMBERS, MEMBERS_HEADER, SENIORS } from "@/data/members";
import MemberCarousel from "@/features/members/components/MemberCarousel";
import { groupMembers } from "@/features/members/lib/sort-members";
import { getMembers } from "@/lib/api/public-api";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Members",
  description: "GDG on Campus PKNU의 코어멤버와 시니어",
  alternates: { canonical: PUBLIC_ROUTES.members },
};

// P-05 Members (IA 4장). 카드는 슬라이드로 보여 주고, 연도 버튼 · URL 쿼리가 없다.
export default async function MembersPage() {
  const { core, senior } = groupMembers(await getMembers());

  return (
    <>
      <PageHeader title={MEMBERS_HEADER.title} description={MEMBERS_HEADER.description} />

      <PageSection id="core-members" badge={CORE_MEMBERS.badge} title={CORE_MEMBERS.title}>
        <MemberCarousel
          label="코어멤버"
          members={core}
          emptyMessage={CORE_MEMBERS.empty}
          analyticsSection="core_members"
        />
      </PageSection>

      <PageSection
        id="seniors"
        badge={SENIORS.badge}
        title={SENIORS.title}
        subtitle={SENIORS.subtitle}
      >
        <MemberCarousel
          label="시니어"
          members={senior}
          emptyMessage={SENIORS.empty}
          analyticsSection="seniors"
        />
      </PageSection>

      <PromiseSection page="members" />
    </>
  );
}
