import { Suspense } from "react";

import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import WaveCanvas from "@/components/common/WaveCanvas";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CURRENT_STUDIES, PAST_STUDIES, STUDIES_HEADER } from "@/data/studies";
import StudyBoard from "@/features/studies/components/StudyBoard";
import StudyDetailController from "@/features/studies/components/StudyDetailController";
import { getStudies } from "@/lib/api/public-api";
import { splitByStatus } from "@/lib/split-by-status";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Studies",
  description: "GDG on Campus PKNU의 진행 중인 스터디와 연도별 과거 스터디",
  // ?study= 가 붙은 주소도 목록 페이지를 대표 주소로 둔다
  alternates: { canonical: PUBLIC_ROUTES.studies },
};

// P-03 Studies. 서버 컴포넌트이고 searchParams 를 읽지 않는다 (정적 렌더링 유지) — 쿼리는 클라이언트 컴포넌트만 읽는다.
export default async function StudiesPage() {
  const studies = await getStudies();
  const { current, past } = splitByStatus(studies);

  return (
    <>
      {/* 머리말 + 두 섹션을 파란 배경 위 물결 흰 영역에 담는다 (WaveCanvas — Projects 와 같은 파도 인트로) */}
      <WaveCanvas framePreset="studiesFrame" sheetPreset="studiesSheet">
        <PageHeader
          title={STUDIES_HEADER.title}
          description={STUDIES_HEADER.description}
          titleVariant="home"
          tone="plain"
        />

        {/* 진행 중 스터디 그리드 + 연도별 과거 스터디. 정렬 · 연도 선택은 브라우저에서 바뀐다 */}
        <StudyBoard
          current={current}
          past={past}
          currentText={CURRENT_STUDIES}
          pastText={PAST_STUDIES}
        />
      </WaveCanvas>

      {/* ↳ 상세 카드 (?study=) */}
      <Suspense fallback={null}>
        <StudyDetailController studies={studies} />
      </Suspense>
    </>
  );
}
