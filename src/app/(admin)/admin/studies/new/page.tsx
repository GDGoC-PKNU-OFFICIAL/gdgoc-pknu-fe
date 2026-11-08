import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StudyForm from "@/features/studies/admin/StudyForm";

export const metadata: Metadata = {
  title: "스터디 등록",
};

// A-22 스터디 등록 (IA 8-4). 수정(A-23)과 같은 폼을 쓴다.
export default function AdminStudyNewPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader title="스터디 등록" />
      <StudyForm />
    </section>
  );
}
