import { Suspense } from "react";

import Link from "next/link";

import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { buttonStyles } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_ROUTES } from "@/constants/routes";
import EventListScreen from "@/features/events/admin/EventListScreen";

export const metadata: Metadata = {
  title: "일정",
};

// A-31 일정 목록 (IA 8-3). 목록은 검색 · 필터 쿼리(useSearchParams)를 읽는 클라이언트 화면이라 Suspense 로 감싼다.
export default function AdminEventsPage() {
  return (
    <section className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <AdminPageHeader
        title="일정"
        description="공개 Events 페이지의 캘린더 · 일정 목록입니다. 같은 날 순서는 ↑↓ 로 바꿉니다."
        action={
          <Link href={ADMIN_ROUTES.eventsNew} className={buttonStyles()}>
            + 새로 등록
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <EventListScreen />
      </Suspense>
    </section>
  );
}
