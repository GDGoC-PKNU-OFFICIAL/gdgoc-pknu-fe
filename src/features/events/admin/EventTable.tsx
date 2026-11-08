import Link from "next/link";

import { buttonStyles } from "@/components/ui/Button";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import type { EventItem } from "@/types/api";

import { EVENT_CATEGORY_STYLES, formatEventDate } from "../lib/event-labels";

import { dayPositions } from "./event-order";

export function eventEditHref(id: number): string {
  return `${ADMIN_ROUTES.events}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

interface EventTableProps {
  events: EventItem[];
  /** 같은 날 순서 조정 버튼을 보여 줄지 (필터 · 정렬 조건에 따라 — canReorder) */
  reorderable: boolean;
  /** 순서를 저장하는 중인 일정 id. 그동안 순서 버튼을 모두 막는다 */
  movingId: number | null;
  onMove: (event: EventItem, delta: -1 | 1) => void;
  onDelete: (event: EventItem) => void;
}

function ArrowIcon({ up }: { up: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-4", !up && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

/**
 * A-31 일정 목록 표 (IA 8-3 "날짜 · 순서 · 제목 · 카테고리 · 장소 | 수정 | 삭제").
 * 같은 날짜에 2건 이상이면 ↑↓ 버튼으로 순서를 바꾼다 (키보드 · 모바일 공용 — 드래그는 두지 않았다).
 * 좁은 화면에서는 표 영역 안에서만 가로로 스크롤한다 — 페이지 전체 가로 스크롤 금지 (IA 5-7).
 */
export default function EventTable({
  events,
  reorderable,
  movingId,
  onMove,
  onDelete,
}: EventTableProps) {
  const positions = dayPositions(events);

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <caption className="sr-only">일정 목록</caption>
        <thead className="border-b border-line bg-surface-muted text-xs text-ink-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              날짜
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              순서
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              제목
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              카테고리
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              장소
            </th>
            <th scope="col" className="px-2 py-3 text-center font-medium">
              수정
            </th>
            <th scope="col" className="px-2 py-3 text-center font-medium">
              삭제
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {events.map((event) => {
            const position = positions.get(event.id) ?? { index: 0, count: 1 };
            const sameDayContinued = position.index > 0;
            const showOrder = reorderable && position.count > 1;
            return (
              <tr key={event.id}>
                <td
                  className={cn(
                    "px-4 py-2 whitespace-nowrap tabular-nums",
                    // 같은 날 두 번째 행부터는 날짜를 흐리게 — 한 날짜 묶음으로 읽히게 한다
                    sameDayContinued && "text-ink-muted/60",
                  )}
                >
                  {formatEventDate(event)}
                </td>
                <td className="px-4 py-2">
                  {showOrder ? (
                    <div className="flex items-center gap-1">
                      <span className="w-5 text-center text-xs text-ink-muted tabular-nums">
                        {position.index + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`${event.title} 위로`}
                        disabled={movingId !== null || position.index === 0}
                        onClick={() => onMove(event, -1)}
                        className={buttonStyles({ variant: "ghost", size: "icon" })}
                      >
                        <ArrowIcon up />
                      </button>
                      <button
                        type="button"
                        aria-label={`${event.title} 아래로`}
                        disabled={movingId !== null || position.index === position.count - 1}
                        onClick={() => onMove(event, 1)}
                        className={buttonStyles({ variant: "ghost", size: "icon" })}
                      >
                        <ArrowIcon up={false} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <th scope="row" className="max-w-64 px-4 py-2 font-medium">
                  <span className="line-clamp-2 break-keep">{event.title}</span>
                  {event.time && (
                    <span className="block truncate text-xs font-normal text-ink-muted">
                      {event.time}
                    </span>
                  )}
                </th>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2.5 rounded-full",
                        EVENT_CATEGORY_STYLES[event.category].dot,
                      )}
                    />
                    {EVENT_CATEGORY_LABELS[event.category]}
                  </span>
                </td>
                <td className="max-w-48 truncate px-4 py-2 text-ink-muted">{event.place ?? "—"}</td>
                <td className="px-2 py-2 text-center">
                  <Link
                    href={eventEditHref(event.id)}
                    aria-label={`${event.title} 수정`}
                    className={buttonStyles({ variant: "ghost", size: "icon" })}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
                    </svg>
                  </Link>
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    aria-label={`${event.title} 삭제`}
                    onClick={() => onDelete(event)}
                    className={buttonStyles({
                      variant: "ghost",
                      size: "icon",
                      className: "text-brand-red hover:bg-brand-red/10",
                    })}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
