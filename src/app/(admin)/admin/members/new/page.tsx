import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MemberForm from "@/features/members/admin/MemberForm";

export const metadata: Metadata = {
  title: "멤버 등록",
};

// A-42 멤버 등록 (IA 8-4). 수정(A-43)과 같은 폼을 쓴다.
export default function AdminMemberNewPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader title="멤버 등록" />
      <MemberForm />
    </section>
  );
}
