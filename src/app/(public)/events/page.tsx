import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import PromiseSection from "@/components/common/PromiseSection";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { EVENTS_HEADER } from "@/data/events";
import EventsBoard from "@/features/events/components/EventsBoard";
import { getEvents } from "@/lib/api/public-api";
import { todayKst } from "@/lib/date";

// ISR 30분. 정적 분석 대상이라 constants/config 의 REVALIDATE_SECONDS 를 import 할 수 없다 (값을 바꾸면 함께 고친다)
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Events",
  description: "GDG on Campus PKNU의 세션 · 행사 캘린더",
  alternates: { canonical: PUBLIC_ROUTES.events },
};

// P-04 Events (IA 4장). 카테고리 필터 · 이벤트 상세가 없다. 캘린더와 일정 목록은 EventsBoard 에 함께 있다.
export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader title={EVENTS_HEADER.title} description={EVENTS_HEADER.description} />
      <EventsBoard events={events} serverToday={todayKst()} />
      <PromiseSection page="events" />
    </>
  );
}
