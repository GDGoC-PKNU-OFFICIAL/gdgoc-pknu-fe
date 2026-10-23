import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProjectForm from "@/features/projects/admin/ProjectForm";

export const metadata: Metadata = {
  title: "프로젝트 등록",
};

// A-12 프로젝트 등록 (IA 8-4). 수정(A-13)과 같은 폼을 쓴다.
export default function AdminProjectNewPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader title="프로젝트 등록" />
      <ProjectForm />
    </section>
  );
}
