import Link from "next/link";

import SafeImage from "@/components/common/SafeImage";
import Badge from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { CONTENT_STATUS_LABELS, PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { ADMIN_EDIT_SEGMENT, ADMIN_ROUTES } from "@/constants/routes";
import { formatKstDateTime, formatMonthPeriod } from "@/lib/date";
import type { Project } from "@/types/api";

import { DEFAULT_PROJECT_IMAGE, PROJECT_CATEGORY_TONES } from "../lib/project-labels";

export function projectEditHref(id: number): string {
  return `${ADMIN_ROUTES.projects}/${id}/${ADMIN_EDIT_SEGMENT}`;
}

interface ProjectTableProps {
  projects: Project[];
  onDelete: (project: Project) => void;
}

/**
 * A-11 프로젝트 목록 표 (IA 8-3 "썸네일 · 제목 · 유형 · 상태 · 기간 · 수정일 | 수정 | 삭제").
 * 좁은 화면에서는 표 영역 안에서만 가로로 스크롤한다 — 페이지 전체 가로 스크롤 금지 (IA 5-7).
 */
export default function ProjectTable({ projects, onDelete }: ProjectTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <caption className="sr-only">프로젝트 목록</caption>
        <thead className="border-b border-line bg-surface-muted text-xs text-ink-muted">
          <tr>
            <th scope="col" className="w-24 px-4 py-3 font-medium">
              썸네일
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              제목
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              유형
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              상태
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              기간
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
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="px-4 py-2">
                <div className="relative aspect-video w-20 overflow-hidden rounded-md bg-surface-muted">
                  <SafeImage
                    src={project.thumbnailUrl}
                    fallbackSrc={DEFAULT_PROJECT_IMAGE}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </td>
              <th scope="row" className="max-w-64 px-4 py-2 font-medium">
                <span className="line-clamp-2 break-keep">{project.title}</span>
                <span className="block truncate text-xs font-normal text-ink-muted">
                  {project.slug}
                </span>
              </th>
              <td className="px-4 py-2">
                <Badge tone={PROJECT_CATEGORY_TONES[project.category]}>
                  {PROJECT_CATEGORY_LABELS[project.category]}
                </Badge>
              </td>
              <td className="px-4 py-2">
                <Badge tone={project.status === "current" ? "green" : "neutral"}>
                  {CONTENT_STATUS_LABELS[project.status]}
                </Badge>
              </td>
              <td className="px-4 py-2 whitespace-nowrap tabular-nums">
                {formatMonthPeriod(project.period)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-ink-muted tabular-nums">
                {formatKstDateTime(new Date(project.updatedAt))}
              </td>
              <td className="px-2 py-2 text-center">
                <Link
                  href={projectEditHref(project.id)}
                  aria-label={`${project.title} 수정`}
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
                  aria-label={`${project.title} 삭제`}
                  onClick={() => onDelete(project)}
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
