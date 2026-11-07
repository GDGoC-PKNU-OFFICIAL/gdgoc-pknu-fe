import EmptyState from "@/components/common/EmptyState";
import type { EventItem } from "@/types/api";

import EventRow from "./EventRow";

interface UpcomingEventListProps {
  /** 이미 걸러 정렬한 일정 */
  events: EventItem[];
  emptyMessage: string;
  /** 선택 중인 일정 id (Events 페이지) */
  selectedId?: number | null;
  /** 있으면 행을 눌러 선택할 수 있다 */
  onSelect?: (event: EventItem) => void;
}

/** 일정 행 목록. 홈 다가오는 일정 · Events 일정 목록이 같이 쓴다 */
export default function UpcomingEventList({
  events,
  emptyMessage,
  selectedId,
  onSelect,
}: UpcomingEventListProps) {
  if (events.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventRow event={event} selected={event.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
