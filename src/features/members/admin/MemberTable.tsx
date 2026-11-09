import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { MEMBER_PART_LABELS, MEMBER_ROLE_LABELS, MEMBER_STATUS_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { formatKstDateTime } from "@/lib/date";
import type { AdminMember } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE, MEMBER_ROLE_TONES } from "../lib/member-labels";

export function memberEditHref(id: number): string {
  return `${ADMIN_ROUTES.members}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

interface MemberTableProps {
  members: AdminMember[];
  onDelete: (member: AdminMember) => void;
}

/**
 * A-41 멤버 목록 표 (IA 8-3 "사진 · 이름 · 구분 · 역할 · 분야 · 수정일 | 수정 | 삭제").
 * 좁은 화면에서는 표 영역 안에서만 가로로 스크롤한다 — 페이지 전체 가로 스크롤 금지 (IA 5-7).
 */
export default function MemberTable({ members, onDelete }: MemberTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <caption className="sr-only">멤버 목록</caption>
        <thead className="border-b border-line bg-surface-muted text-xs text-ink-muted">
          <tr>
            <th scope="col" className="w-16 px-4 py-3 font-medium">
              사진
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              이름
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              구분
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              역할
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              분야
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              수정일
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
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-2">
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
              <td className="px-4 py-2">
                <Badge tone={member.status === "core" ? "blue" : "neutral"}>
                  {MEMBER_STATUS_LABELS[member.status]}
                </Badge>
              </td>
              <td className="px-4 py-2">
                {member.status === "core" ? (
                  <Badge tone={MEMBER_ROLE_TONES[member.role]}>
                    {MEMBER_ROLE_LABELS[member.role]}
                  </Badge>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{MEMBER_PART_LABELS[member.part]}</td>
              <td className="px-4 py-2 whitespace-nowrap text-ink-muted tabular-nums">
                {formatKstDateTime(new Date(member.updatedAt))}
              </td>
              <td className="px-2 py-2 text-center">
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
              <td className="px-2 py-2 text-center">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
