import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { CONTENT_STATUS_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { formatKstDateTime, formatMonthPeriod } from "@/lib/date";
import type { Study } from "@/types/api";

export function studyEditHref(id: number): string {
  return `${ADMIN_ROUTES.studies}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

interface StudyTableProps {
  studies: Study[];
  onDelete: (study: Study) => void;
}

/**
 * A-21 스터디 목록 표 (IA 8-3 "제목 · 주제 · 상태 · 기간 · 리더 · 수정일 | 수정 | 삭제").
 * 좁은 화면에서는 표 영역 안에서만 가로로 스크롤한다 — 페이지 전체 가로 스크롤 금지 (IA 5-7).
 */
export default function StudyTable({ studies, onDelete }: StudyTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <caption className="sr-only">스터디 목록</caption>
        <thead className="border-b border-line bg-surface-muted text-xs text-ink-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              제목
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              주제
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              상태
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              기간
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              리더
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
          {studies.map((study) => (
            <tr key={study.id}>
              <th scope="row" className="max-w-64 px-4 py-2 font-medium">
                <span className="line-clamp-2 break-keep">{study.title}</span>
                <span className="block truncate text-xs font-normal text-ink-muted">
                  {study.slug}
                </span>
              </th>
              <td className="px-4 py-2">
                <Badge tone="blue">{study.topic}</Badge>
              </td>
              <td className="px-4 py-2">
                <Badge tone={study.status === "current" ? "green" : "neutral"}>
                  {CONTENT_STATUS_LABELS[study.status]}
                </Badge>
              </td>
              <td className="px-4 py-2 whitespace-nowrap tabular-nums">
                {formatMonthPeriod(study.period)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {study.leader}
                {study.participants.length > 0 && (
                  <span className="ml-1 text-xs text-ink-muted">
                    외 {study.participants.length}명
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-ink-muted tabular-nums">
                {formatKstDateTime(new Date(study.updatedAt))}
              </td>
              <td className="px-2 py-2 text-center">
                <Link
                  href={studyEditHref(study.id)}
                  aria-label={`${study.title} 수정`}
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
                  aria-label={`${study.title} 삭제`}
                  onClick={() => onDelete(study)}
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
