"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import DraftRestoreDialog from "@/components/admin/DraftRestoreDialog";
import FormField, { FormFieldset, FormSection } from "@/components/admin/FormField";
import FormFooter from "@/components/admin/FormFooter";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useDraft } from "@/components/admin/hooks/use-draft";
import { useLeaveWarning } from "@/components/admin/hooks/use-leave-warning";
import { useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import ImageUploadField, { type UploadStatus } from "@/components/admin/ImageUploadField";
import { applyFieldErrors } from "@/components/admin/lib/apply-field-errors";
import { draftKey } from "@/components/admin/lib/draft-storage";
import { listErrors } from "@/components/admin/lib/list-errors";
import StringListField from "@/components/admin/StringListField";
import TagInput from "@/components/admin/TagInput";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { MEMBER_PART_LABELS, MEMBER_ROLE_LABELS, MEMBER_STATUS_LABELS } from "@/constants/labels";
import { MEMBER_LIMITS } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { createMember, updateMember } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";
import { formatKstDateTime } from "@/lib/date";
import { type AdminMember, MEMBER_PARTS, MEMBER_ROLES, MEMBER_STATUSES } from "@/types/api";

import { DEFAULT_MEMBER_IMAGE } from "../lib/member-labels";

import {
  emptyMemberForm,
  type MemberFormOutput,
  type MemberFormValues,
  memberFormSchema,
  memberToForm,
  toMemberRequest,
} from "./member-schema";
import MemberCardPreview from "./MemberCardPreview";

const L = MEMBER_LIMITS;

const ROLE_OPTIONS = MEMBER_ROLES.map((value) => ({ value, label: MEMBER_ROLE_LABELS[value] }));
const PART_OPTIONS = MEMBER_PARTS.map((value) => ({ value, label: MEMBER_PART_LABELS[value] }));

const MESSAGES = {
  saved: "저장했습니다. 사이트에 곧 반영됩니다.",
  invalid: "입력값을 확인해 주세요.",
  uploading: "이미지 업로드가 끝난 뒤 저장해 주세요.",
  uploadFailed: "이미지 업로드에 실패했습니다. 다시 시도하거나 선택을 취소해 주세요.",
} as const;

interface MemberFormProps {
  /** 수정할 멤버. 없으면 등록 폼 (A-42 · A-43 은 같은 폼을 쓴다 — IA 8-4) */
  member?: AdminMember;
}

/**
 * A-42 · A-43 멤버 등록 · 수정 폼 (IA 8-4 · FRONT_ARCHITECTURE § 5-4).
 * 프로젝트 · 스터디 폼과 같은 엔진(react-hook-form + zod + useDraft + useAdminMutation)에
 * 프로필 사진 업로드(ImageUploadField) · 플립 카드 미리보기 · 공개 동의 확인이 붙는다.
 * 시니어를 고르면 역할 칸을 숨기고 role: null 로 보낸다 (명세 2-7).
 */
export default function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<MemberFormValues, unknown, MemberFormOutput>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: member ? memberToForm(member) : emptyMemberForm(),
  });
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form;
  const values = useWatch({ control });
  const isCore = values.status === "core";

  const draft = useDraft({
    form,
    storageKey: draftKey("members", member?.id ?? "new"),
    serverUpdatedAt: member?.updatedAt ?? null,
  });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  const [saved, setSaved] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  useLeaveWarning(isDirty && !saved);

  const submit = form.handleSubmit(
    async (output) => {
      // 401 로 로그인에 가더라도 지금 내용이 남도록 먼저 임시 저장한다 (PRD 4-6)
      draft.saveNow();
      const body = toMemberRequest(output);
      const result = await run(
        () => (member ? updateMember(member.id, body) : createMember(body)),
        {
          successMessage: MESSAGES.saved,
          onError: (error) => {
            const unmatched = applyFieldErrors(form, error.fieldErrors);
            if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
            if (error.fieldErrors.length > 0) return MESSAGES.invalid;
          },
        },
      );
      if (!result.ok) return;
      setSaved(true);
      draft.clear();
      router.push(ADMIN_ROUTES.members);
    },
    () => toast.error(MESSAGES.invalid),
  );

  // 업로드가 끝나지 않았거나 실패했으면 저장하지 않는다 — 이전 사진이 조용히 저장되는 것을 막는다 (IA F-5)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (uploadStatus !== "idle") {
      event.preventDefault();
      toast.error(uploadStatus === "uploading" ? MESSAGES.uploading : MESSAGES.uploadFailed);
      return;
    }
    return submit(event);
  };

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {member && (
          <p className="text-sm text-ink-muted">
            마지막 수정 {formatKstDateTime(new Date(member.updatedAt))}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* 미리보기: 넓은 화면은 오른쪽에 고정, 좁은 화면은 폼 위에 둔다 */}
          <aside className="lg:sticky lg:top-6 lg:order-last lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <MemberCardPreview values={values} />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <FormSection title="구분">
              <FormFieldset id="member-status" legend="구분" required>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_STATUSES.map((status) => (
                    <label
                      key={status}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm",
                        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-blue",
                        values.status === status
                          ? "border-brand-blue bg-brand-blue/5 font-medium"
                          : "border-line",
                      )}
                    >
                      <input
                        type="radio"
                        value={status}
                        className="size-4 accent-brand-blue"
                        {...register("status")}
                      />
                      {MEMBER_STATUS_LABELS[status]}
                    </label>
                  ))}
                </div>
              </FormFieldset>

              {isCore ? (
                <FormField
                  id="member-role"
                  label="역할"
                  required
                  hint="카드 전면 배지로 표시됩니다."
                  error={errors.role?.message}
                >
                  {(control) => (
                    <Select
                      {...control}
                      options={ROLE_OPTIONS}
                      placeholder="선택해 주세요"
                      {...register("role")}
                    />
                  )}
                </FormField>
              ) : (
                <p className="text-sm text-ink-muted">
                  시니어는 역할이 없습니다. 저장하면 역할 정보는 지워집니다.
                </p>
              )}
            </FormSection>

            <FormSection title="카드 전면">
              <Controller
                control={control}
                name="photoUrl"
                render={({ field, fieldState }) => (
                  <ImageUploadField
                    id="member-photoUrl"
                    legend="프로필 사진 (1:1)"
                    target="member"
                    hint="jpg · png · webp, 5MB 이하. 비우면 기본 이미지가 표시됩니다."
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    fallbackSrc={DEFAULT_MEMBER_IMAGE}
                    aspect="square"
                    error={fieldState.error?.message}
                    onStatusChange={setUploadStatus}
                    onBeforeUpload={draft.saveNow}
                  />
                )}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  id="member-name"
                  label="이름"
                  required
                  error={errors.name?.message}
                  counter={{ length: values.name?.length ?? 0, max: L.name }}
                >
                  {(control) => <Input {...control} maxLength={L.name} {...register("name")} />}
                </FormField>
                <FormField
                  id="member-department"
                  label="학과"
                  required
                  error={errors.department?.message}
                  counter={{ length: values.department?.length ?? 0, max: L.department }}
                >
                  {(control) => (
                    <Input
                      {...control}
                      maxLength={L.department}
                      placeholder="컴퓨터공학과"
                      {...register("department")}
                    />
                  )}
                </FormField>
              </div>

              <Controller
                control={control}
                name="history"
                render={({ field, fieldState }) => (
                  <StringListField
                    id="member-history"
                    legend="주요 이력"
                    hint={`최대 ${L.history.max}개, 항목당 ${L.history.itemLength}자`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    limits={L.history}
                    errors={listErrors(fieldState.error)}
                    itemLabel={(i) => `주요 이력 ${i + 1}`}
                    addLabel="이력 추가"
                    placeholder="2025 Solution Challenge Top 100"
                  />
                )}
              />
              <Controller
                control={control}
                name="interests"
                render={({ field, fieldState }) => (
                  <TagInput
                    id="member-interests"
                    legend="관심분야"
                    hint={`최대 ${L.interests.max}개, 각 ${L.interests.itemLength}자`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    limits={L.interests}
                    errors={listErrors(fieldState.error)}
                    placeholder="LLM"
                  />
                )}
              />
            </FormSection>

            <FormSection title="카드 후면">
              <FormField id="member-part" label="분야" required error={errors.part?.message}>
                {(control) => (
                  <Select
                    {...control}
                    options={PART_OPTIONS}
                    placeholder="선택해 주세요"
                    {...register("part")}
                  />
                )}
              </FormField>
              <FormField
                id="member-bio"
                label="한 줄 소개"
                required
                error={errors.bio?.message}
                counter={{ length: values.bio?.length ?? 0, max: L.bio }}
              >
                {(control) => <Input {...control} maxLength={L.bio} {...register("bio")} />}
              </FormField>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  id="member-links-github"
                  label="GitHub"
                  error={errors.links?.github?.message}
                  counter={{ length: values.links?.github?.length ?? 0, max: L.url }}
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="url"
                      inputMode="url"
                      maxLength={L.url}
                      placeholder="https://github.com/…"
                      {...register("links.github")}
                    />
                  )}
                </FormField>
                <FormField
                  id="member-links-homepage"
                  label="소개 페이지"
                  error={errors.links?.homepage?.message}
                  counter={{ length: values.links?.homepage?.length ?? 0, max: L.url }}
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="url"
                      inputMode="url"
                      maxLength={L.url}
                      placeholder="https://…"
                      {...register("links.homepage")}
                    />
                  )}
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="공개 동의"
              description="사진 · 이름 · 학과 · 이력 등은 공개 사이트에 표시됩니다 (개인정보처리방침)."
            >
              <div className="flex flex-col gap-1.5">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    aria-invalid={errors.consentConfirmed ? true : undefined}
                    aria-describedby={
                      errors.consentConfirmed ? "member-consentConfirmed-error" : undefined
                    }
                    className="size-5 shrink-0 accent-brand-blue"
                    {...register("consentConfirmed")}
                  />
                  <span>
                    본인에게 사이트 공개 동의를 받았습니다
                    <span aria-hidden="true" className="ml-0.5 text-brand-red">
                      *
                    </span>
                    <span className="sr-only">(필수)</span>
                  </span>
                </label>
                {member && (
                  <p className="text-xs text-ink-muted">
                    최초 확인 {formatKstDateTime(new Date(member.consentConfirmedAt))}
                  </p>
                )}
                {errors.consentConfirmed && (
                  <p id="member-consentConfirmed-error" className="text-xs text-brand-red">
                    {errors.consentConfirmed.message}
                  </p>
                )}
              </div>
            </FormSection>
          </div>
        </div>

        <FormFooter
          cancelHref={ADMIN_ROUTES.members}
          pending={pending}
          slow={slow}
          draftSavedAt={draft.savedAt}
        />
      </form>

      <DraftRestoreDialog
        savedAt={draft.pendingDraft?.savedAt ?? null}
        stale={draft.pendingDraftIsStale}
        onRestore={draft.restore}
        onDiscard={draft.discard}
      />
    </>
  );
}
