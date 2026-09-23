import { type Metadata } from "next";

import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/Badge";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { PRIVACY } from "@/data/privacy";

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: "GDG on Campus PKNU 웹사이트가 공개 · 수집하는 정보 안내",
  alternates: { canonical: PUBLIC_ROUTES.privacy },
};

// P-06 개인정보처리방침 (IA 4장). 정적 페이지이고 약속 섹션이 없다.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title={PRIVACY.title} description={PRIVACY.description}>
        {PRIVACY.effectiveDate ? (
          <p className="text-sm text-ink-muted">
            시행일 <time dateTime={PRIVACY.effectiveDate}>{PRIVACY.effectiveDate}</time>
          </p>
        ) : (
          <Badge tone="yellow" className="self-start">
            초안 · 시행일 확정 전
          </Badge>
        )}
      </PageHeader>

      <article className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-16 md:px-8">
        {PRIVACY.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed break-keep text-ink-muted">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="flex list-disc flex-col gap-2 pl-5 break-keep text-ink-muted">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </>
  );
}
