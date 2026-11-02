import CardSlider from "@/components/common/CardSlider";
import EmptyState from "@/components/common/EmptyState";
import type { Member } from "@/types/api";

import MemberFlipCard from "./MemberFlipCard";

interface MemberCarouselProps {
  /** 슬라이드 영역 이름 (스크린리더) */
  label: string;
  /** 이미 정렬된 멤버 */
  members: Member[];
  emptyMessage: string;
}

/** 코어멤버 · 시니어 슬라이드 (P-05 #2 · #3). 연도 버튼 · URL 쿼리가 없다 */
export default function MemberCarousel({ label, members, emptyMessage }: MemberCarouselProps) {
  if (members.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <CardSlider label={label}>
      {members.map((member) => (
        <MemberFlipCard key={member.id} member={member} />
      ))}
    </CardSlider>
  );
}
