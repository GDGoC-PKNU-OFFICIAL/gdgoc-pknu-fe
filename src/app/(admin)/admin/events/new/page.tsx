import { type Metadata } from "next";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EventForm from "@/features/events/admin/EventForm";

export const metadata: Metadata = {
  title: "일정 등록",
};

// A-32 일정 등록 (IA 8-4). 수정(A-33)과 같은 폼을 쓴다.
export default function AdminEventNewPage() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-8 md:px-8">
      <AdminPageHeader title="일정 등록" />
      <EventForm />
    </section>
  );
}
