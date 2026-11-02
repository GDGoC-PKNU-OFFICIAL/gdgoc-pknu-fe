import EmptyState from "@/components/common/EmptyState";
import type { Member } from "@/types/api";

import MemberFlipCard from "./MemberFlipCard";

interface MemberGridProps {
  /** 이미 정렬된 멤버 */
  members: Member[];
  emptyMessage: string;
}

/** 홈 코어멤버 그리드 (P-00 #7). 모바일 1열 · 태블릿 2열 · 데스크톱 3열 (IA 5-7) */
export default function MemberGrid({ members, emptyMessage }: MemberGridProps) {
  if (members.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <li key={member.id}>
          <MemberFlipCard member={member} />
        </li>
      ))}
    </ul>
  );
}
