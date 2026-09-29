import Skeleton from "@/components/ui/Skeleton";

const CARD_COUNT = 3;

/**
 * /projects 로 이동하는 동안의 스켈레톤 (C-10). 페이지는 정적 · ISR 이라 주로 다른 페이지에서 넘어올 때 잠깐 보인다.
 * 로딩 안내는 aria-busy 로 전달한다 (Skeleton 자체는 스크린리더에서 숨김).
 */
export default function ProjectsLoading() {
  return (
    <div aria-busy="true" aria-label="프로젝트를 불러오는 중">
      <div className="border-b border-line bg-surface-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-12 md:px-8 md:py-16">
          <Skeleton className="h-10 w-48 md:h-14" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:px-8">
        <Skeleton className="h-8 w-56" />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <li
              key={index}
              className="flex flex-col overflow-hidden rounded-2xl border border-line"
            >
              <Skeleton className="aspect-video rounded-none" />
              <div className="flex flex-col gap-3 p-5">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
