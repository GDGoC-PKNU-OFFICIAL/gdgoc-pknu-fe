import Skeleton from "@/components/ui/Skeleton";

import { SECTION_CONTAINER } from "./PageSection";

const CARD_COUNT = 3;

/** 공개 페이지로 이동하는 동안의 스켈레톤 (C-10). 로딩 안내는 aria-busy 로 전달한다 */
export default function PageSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <div className="border-b border-line bg-surface-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-12 md:px-8 md:py-16">
          <Skeleton className="h-10 w-48 md:h-14" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
      </div>
      <div className={SECTION_CONTAINER}>
        <Skeleton className="h-8 w-56" />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-72 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
