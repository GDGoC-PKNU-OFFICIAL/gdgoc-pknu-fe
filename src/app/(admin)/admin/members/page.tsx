import { Suspense } from "react";

import Link from "next/link";

import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { buttonStyles } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_ROUTES } from "@/constants/routes";
import MemberListScreen from "@/features/members/admin/MemberListScreen";

export const metadata: Metadata = {
  title: "멤버",
};

// A-41 멤버 목록 (IA 8-3). 목록은 검색 · 필터 쿼리(useSearchParams)를 읽는 클라이언트 화면이라 Suspense 로 감싼다.
export default function AdminMembersPage() {
  return (
    <section className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <AdminPageHeader
        title="멤버"
        description="공개 Members 페이지의 코어멤버 · 시니어 카드입니다."
        action={
          <Link href={ADMIN_ROUTES.membersNew} className={buttonStyles()}>
            + 새로 등록
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <MemberListScreen />
      </Suspense>
    </section>
  );
}
