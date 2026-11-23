import CardSlider from "@/components/common/CardSlider";
import EmptyState from "@/components/common/EmptyState";
import type { AnalyticsEvents } from "@/lib/analytics";
import type { Member } from "@/types/api";

import MemberFlipCard from "./MemberFlipCard";

interface MemberCarouselProps {
  /** 슬라이드 영역 이름 (스크린리더) */
  label: string;
  /** 이미 정렬된 멤버 */
  members: Member[];
  emptyMessage: string;
  /** GA4 member_card_flip 의 section */
  analyticsSection: AnalyticsEvents["member_card_flip"]["section"];
}

/** 코어멤버 · 시니어 슬라이드 (P-05 #2 · #3). 연도 버튼 · URL 쿼리가 없다 */
export default function MemberCarousel({
  label,
  members,
  emptyMessage,
  analyticsSection,
}: MemberCarouselProps) {
  if (members.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    // 세로로 긴 4 : 5 카드라 데스크톱에서 한 줄에 4장씩 — 카드가 너무 커지지 않게 한다
    <CardSlider label={label} density="dense">
      {members.map((member) => (
        <MemberFlipCard key={member.id} member={member} analyticsSection={analyticsSection} />
      ))}
    </CardSlider>
  );
}
