import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { MEMBER_STATUS_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { formatKstDateTime } from "@/lib/date";
import type { AdminMember } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE } from "../lib/member-labels";

import { statusPositions } from "./member-order";

export function memberEditHref(id: number): string {
  return `${ADMIN_ROUTES.members}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

interface MemberTableProps {
  members: AdminMember[];
  /** 공개 화면 순서로 볼 때만 ↑↓ 를 보인다 */
  reorderable: boolean;
  /** 순서를 저장하는 중인 멤버 id. 그동안 순서 버튼을 모두 막는다 */
  movingId: number | null;
  onMove: (member: AdminMember, delta: -1 | 1) => void;
  onDelete: (member: AdminMember) => void;
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
 * A-41 멤버 목록 표 ("순서 · 사진 · 이름 · 구분 · 분야 · 수정일 | 수정 | 삭제").
 * 순서는 공개 Members 화면 순서이며 구분(코어멤버 · 시니어)마다 따로 매긴다 — ↑↓ 로 바꾸면 바로 저장한다.
 * 좁은 화면에서는 표 영역 안에서만 가로로 스크롤한다 — 페이지 전체 가로 스크롤 금지 (IA 5-7).
 */
export default function MemberTable({
  members,
  reorderable,
  movingId,
  onMove,
  onDelete,
}: MemberTableProps) {
  const positions = statusPositions(members);

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <caption className="sr-only">멤버 목록</caption>
        <thead className="sticky top-0 z-[1] border-b border-line bg-surface-muted text-xs font-semibold text-ink-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              순서
            </th>
            <th scope="col" className="w-16 px-3 py-2 font-medium">
              사진
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              이름
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              구분
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              분야
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              수정일
            </th>
            <th scope="col" className="px-2 py-1.5 text-center font-medium">
              수정
            </th>
            <th scope="col" className="px-2 py-1.5 text-center font-medium">
              삭제
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line [&>tr]:transition-colors [&>tr:hover]:bg-brand-blue/[0.04] [&>tr:nth-child(even)]:bg-surface-muted/40">
          {members.map((member) => {
            const position = positions.get(member.id) ?? { index: 0, count: 1 };
            return (
              <tr key={member.id}>
                <td className="px-3 py-1.5">
                  {reorderable ? (
                    <div className="flex items-center gap-1">
                      <span className="w-5 text-center text-xs text-ink-muted tabular-nums">
                        {position.index + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`${member.name} 위로`}
                        disabled={movingId !== null || position.index === 0}
                        onClick={() => onMove(member, -1)}
                        className={buttonStyles({ variant: "ghost", size: "icon" })}
                      >
                        <ArrowIcon up />
                      </button>
                      <button
                        type="button"
                        aria-label={`${member.name} 아래로`}
                        disabled={movingId !== null || position.index === position.count - 1}
                        onClick={() => onMove(member, 1)}
                        className={buttonStyles({ variant: "ghost", size: "icon" })}
                      >
                        <ArrowIcon up={false} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <div className="relative size-10 overflow-hidden rounded-lg bg-surface-muted">
                    <SafeImage
                      src={member.photoUrl}
                      fallbackSrc={DEFAULT_MEMBER_IMAGE}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                </td>
                <th scope="row" className="max-w-56 px-4 py-2 font-medium">
                  <span className="block truncate">{member.name}</span>
                  <span className="block truncate text-xs font-normal text-ink-muted">
                    {member.department}
                  </span>
                </th>
                <td className="px-3 py-1.5">
                  <Badge tone={member.status === "core" ? "blue" : "neutral"}>
                    {MEMBER_STATUS_LABELS[member.status]}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap">{member.part}</td>
                <td className="px-3 py-1.5 whitespace-nowrap text-ink-muted tabular-nums">
                  {formatKstDateTime(new Date(member.updatedAt))}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Link
                    href={memberEditHref(member.id)}
                    aria-label={`${member.name} 수정`}
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
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    aria-label={`${member.name} 삭제`}
                    onClick={() => onDelete(member)}
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
