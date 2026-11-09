"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { type Member, MEMBER_ROLES, type MemberPart, type MemberRole } from "@/types/api";

import MemberFlipCard from "../components/MemberFlipCard";

import type { MemberFormValues } from "./member-schema";
import type { DeepPartial } from "react-hook-form";

/** 아직 비어 있는 칸은 자리 표시 문구로 채워 카드 모양을 유지한다 */
const PLACEHOLDERS = {
  name: "이름",
  department: "학과",
  bio: "한 줄 소개",
} as const;

type FaceOption = "front" | "back";

const FACES: { value: FaceOption; label: string }[] = [
  { value: "front", label: "전면" },
  { value: "back", label: "후면" },
];

function isMemberRole(value: string | undefined): value is MemberRole {
  return (MEMBER_ROLES as readonly (string | undefined)[]).includes(value);
}

/** 입력 중인 폼 값 → 카드가 받는 Member. 입력 중 값이라 비거나 형식이 덜 맞을 수 있다 */
function toPreviewMember(values: DeepPartial<MemberFormValues>): Member {
  const trim = (value: string | undefined) => value?.trim() ?? "";
  const items = (list: (string | undefined)[] | undefined) =>
    (list ?? []).map(trim).filter((item) => item !== "");
  const base = {
    id: 0,
    createdAt: "",
    updatedAt: "",
    name: trim(values.name) || PLACEHOLDERS.name,
    photoUrl: values.photoUrl ?? undefined,
    department: trim(values.department) || PLACEHOLDERS.department,
    history: items(values.history),
    interests: items(values.interests),
    // 분야를 아직 고르지 않았으면 빈 값 — 카드가 "—" 로 보여 준다
    part: (values.part ?? "") as MemberPart,
    bio: trim(values.bio) || PLACEHOLDERS.bio,
    links: {},
  };
  // 코어멤버인데 역할을 아직 안 골랐으면 배지 없이 보여 준다 (시니어 카드와 같은 모양)
  return values.status === "core" && isMemberRole(values.role)
    ? { ...base, status: "core", role: values.role }
    : { ...base, status: "senior" };
}

/**
 * 플립 카드 미리보기 (IA 8-4 A-42 · A-43 "실시간 반영"). 공개 Members 와 같은 카드(C-05)를 그대로 쓴다.
 * [전면] · [후면] 버튼으로만 뒤집는다 — 폼 입력 중 마우스가 지나가며 카드가 뒤집히지 않게 한다.
 */
export default function MemberCardPreview({ values }: { values: DeepPartial<MemberFormValues> }) {
  const [face, setFace] = useState<FaceOption>("front");

  return (
    <section aria-labelledby="member-preview-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="member-preview-title" className="text-base font-bold">
          카드 미리보기
        </h2>
        <div
          role="group"
          aria-label="미리볼 면"
          className="flex gap-1 rounded-full bg-surface-muted p-1"
        >
          {FACES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={face === value}
              onClick={() => setFace(value)}
              className={cn(
                "min-h-11 rounded-full px-4 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                face === value ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <MemberFlipCard member={toPreviewMember(values)} previewFace={face} />
      <p className="text-xs text-ink-muted">
        공개 Members 페이지에 보이는 카드입니다. 입력하면 바로 반영됩니다.
      </p>
    </section>
  );
}
