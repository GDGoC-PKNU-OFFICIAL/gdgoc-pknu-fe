import { Suspense } from "react";

import Link from "next/link";

import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { buttonStyles } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_ROUTES } from "@/constants/routes";
import ProjectListScreen from "@/features/projects/admin/ProjectListScreen";

export const metadata: Metadata = {
  title: "프로젝트",
};

// A-11 프로젝트 목록 (IA 8-3). 목록은 검색 · 필터 쿼리(useSearchParams)를 읽는 클라이언트 화면이라 Suspense 로 감싼다.
export default function AdminProjectsPage() {
  return (
    <section className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <AdminPageHeader
        title="프로젝트"
        description="현재 · 과거는 종료월로 자동 구분됩니다."
        action={
          <Link href={ADMIN_ROUTES.projectsNew} className={buttonStyles()}>
            + 새로 등록
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <ProjectListScreen />
      </Suspense>
    </section>
  );
}
