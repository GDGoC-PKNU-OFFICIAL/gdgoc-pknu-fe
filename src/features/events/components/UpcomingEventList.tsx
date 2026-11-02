import EmptyState from "@/components/common/EmptyState";
import type { EventItem } from "@/types/api";

import EventRow from "./EventRow";

interface UpcomingEventListProps {
  /** 이미 걸러 정렬한 다가오는 일정 */
  events: EventItem[];
  emptyMessage: string;
  /** 일정 행에 앵커를 붙일지 (Events 페이지) */
  anchored?: boolean;
}

/** 일정 행 목록. 홈 다가오는 일정 · Events 일정 목록이 같이 쓴다 */
export default function UpcomingEventList({
  events,
  emptyMessage,
  anchored,
}: UpcomingEventListProps) {
  if (events.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventRow event={event} anchored={anchored} />
        </li>
      ))}
    </ul>
  );
}
