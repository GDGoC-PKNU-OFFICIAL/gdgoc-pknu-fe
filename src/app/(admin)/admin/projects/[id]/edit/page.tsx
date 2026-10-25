import { notFound } from "next/navigation";

import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProjectEditScreen from "@/features/projects/admin/ProjectEditScreen";

export const metadata: Metadata = {
  title: "프로젝트 수정",
};

/** Spring 의 {id:\d+} 와 같은 규칙. 숫자가 아니면 요청하지 않고 404 */
const ID_PATTERN = /^\d+$/;

/** JS number 로 정확히 담기는 id 인지 — 2^53 을 넘으면 반올림되어 다른 항목을 요청한다 */
function isValidId(id: string): boolean {
  return ID_PATTERN.test(id) && Number.isSafeInteger(Number(id));
}

// A-13 프로젝트 수정 (IA 8-4). 데이터는 브라우저에서 BFF 로 불러온다 — 관리자 요청은 쿠키를 들고 BFF 를 거친다.
export default async function AdminProjectEditPage({
  params,
}: PageProps<"/admin/projects/[id]/edit">) {
  const { id } = await params;
  if (!isValidId(id)) notFound();

  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader title="프로젝트 수정" />
      <ProjectEditScreen id={Number(id)} />
    </section>
  );
}
