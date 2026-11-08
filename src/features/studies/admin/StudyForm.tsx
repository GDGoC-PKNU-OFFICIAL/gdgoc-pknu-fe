"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import DraftRestoreDialog from "@/components/admin/DraftRestoreDialog";
import FormField, { FormFieldset, FormSection } from "@/components/admin/FormField";
import FormFooter from "@/components/admin/FormFooter";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useCurrentYearMonth } from "@/components/admin/hooks/use-current-year-month";
import { useDraft } from "@/components/admin/hooks/use-draft";
import { useLeaveWarning } from "@/components/admin/hooks/use-leave-warning";
import { useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { useSlugCheck } from "@/components/admin/hooks/use-slug-check";
import { applyFieldErrors } from "@/components/admin/lib/apply-field-errors";
import { draftKey } from "@/components/admin/lib/draft-storage";
import { listErrors } from "@/components/admin/lib/list-errors";
import { suggestSlug } from "@/components/admin/lib/suggest-slug";
import { adminYears } from "@/components/admin/lib/year-options";
import TagInput from "@/components/admin/TagInput";
import YearMonthSelect from "@/components/admin/YearMonthSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SLUG_PATTERN, STUDY_LIMITS } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { checkStudySlug, createStudy, updateStudy } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";
import { formatKstDateTime, isYearMonth, parseYearMonth } from "@/lib/date";
import type { ContentStatus, Study } from "@/types/api";

import { STUDY_STATUS_LABELS } from "../lib/study-labels";

import {
  emptyStudyForm,
  type StudyFormOutput,
  type StudyFormValues,
  studyFormSchema,
  studyToForm,
  toStudyRequest,
} from "./study-schema";

const L = STUDY_LIMITS;

const MESSAGES = {
  saved: "저장했습니다. 사이트에 곧 반영됩니다.",
  invalid: "입력값을 확인해 주세요.",
  slugTaken: "이미 사용 중인 슬러그입니다.",
} as const;

/** 종료월로 계산한 진행 상태 (명세 1-4). 아직 고르는 중이면 null */
function statusOfEnd(end: string, currentYearMonth: string | null): ContentStatus | null {
  if (end === "") return "current";
  if (!isYearMonth(end) || currentYearMonth === null) return null;
  return end >= currentYearMonth ? "current" : "past";
}

function yearOf(value: string | undefined): number | null {
  return value && isYearMonth(value) ? parseYearMonth(value).year : null;
}

interface StudyFormProps {
  /** 수정할 스터디. 없으면 등록 폼 (A-22 · A-23 은 같은 폼을 쓴다 — IA 8-4) */
  study?: Study;
}

/**
 * A-22 · A-23 스터디 등록 · 수정 폼 (IA 8-4 · FRONT_ARCHITECTURE § 5-4).
 * 프로젝트 폼과 같은 엔진: react-hook-form + zod(1차 검증) + useDraft(임시 저장) + useAdminMutation(저장 · 토스트 · 401).
 */
export default function StudyForm({ study }: StudyFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = study !== undefined;

  const form = useForm<StudyFormValues, unknown, StudyFormOutput>({
    resolver: zodResolver(studyFormSchema),
    defaultValues: study ? studyToForm(study) : emptyStudyForm(),
  });
  const {
    control,
    register,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = form;
  const outputs = useFieldArray({ control, name: "outputs" });
  const values = useWatch({ control });

  const draft = useDraft({
    form,
    storageKey: draftKey("studies", study?.id ?? "new"),
    serverUpdatedAt: study?.updatedAt ?? null,
  });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  const [saved, setSaved] = useState(false);
  useLeaveWarning(isDirty && !saved);

  // 슬러그: 등록 폼에서 슬러그를 직접 고치기 전까지는 제목에서 제안한다 (IA 8-4)
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const slug = (values.slug ?? "").trim();
  const studyId = study?.id;
  const checkSlug = useCallback(
    (value: string, signal: AbortSignal) =>
      checkStudySlug({ slug: value, excludeId: studyId }, signal).then((r) => r.available),
    [studyId],
  );
  const slugStatus = useSlugCheck(slug, {
    enabled: SLUG_PATTERN.test(slug) && slug.length <= L.slug && slug !== study?.slug,
    check: checkSlug,
  });

  const currentYearMonth = useCurrentYearMonth();
  const years = adminYears(
    currentYearMonth ? parseYearMonth(currentYearMonth).year : null,
    yearOf(values.period?.start),
    yearOf(values.period?.end),
  );
  const status = statusOfEnd(values.period?.end ?? "", currentYearMonth);

  const onSubmit = form.handleSubmit(
    async (output) => {
      if (slugStatus === "taken") {
        setError("slug", { type: "server", message: MESSAGES.slugTaken }, { shouldFocus: true });
        toast.error(MESSAGES.invalid);
        return;
      }
      // 401 로 로그인에 가더라도 지금 내용이 남도록 먼저 임시 저장한다 (PRD 4-6)
      draft.saveNow();
      const body = toStudyRequest(output);
      const result = await run(() => (study ? updateStudy(study.id, body) : createStudy(body)), {
        successMessage: MESSAGES.saved,
        onError: (error) => {
          const unmatched = applyFieldErrors(form, error.fieldErrors);
          // 필드에 붙지 못한 에러(기간 전체 규칙 등)는 서버 문구를 그대로 보여 준다
          if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
          if (error.fieldErrors.length > 0) return MESSAGES.invalid;
        },
      });
      if (!result.ok) return;
      setSaved(true);
      draft.clear();
      router.push(ADMIN_ROUTES.studies);
    },
    () => toast.error(MESSAGES.invalid),
  );

  const slugHint =
    slugStatus === "checking"
      ? "중복 확인 중…"
      : slugStatus === "available"
        ? "사용할 수 있는 슬러그입니다."
        : slugStatus === "error"
          ? "중복 확인에 실패했습니다. 저장할 때 다시 확인합니다."
          : "스터디를 구분하는 고유 주소입니다. 영문 소문자 · 숫자 · 하이픈";

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {study && (
          <p className="text-sm text-ink-muted">
            마지막 수정 {formatKstDateTime(new Date(study.updatedAt))}
          </p>
        )}

        <FormSection title="기본 정보">
          <FormField
            id="study-title"
            label="제목"
            required
            error={errors.title?.message}
            counter={{ length: values.title?.length ?? 0, max: L.title }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.title}
                {...register("title", {
                  onChange: (event: { target: { value: string } }) => {
                    if (!slugEdited) {
                      setValue("slug", suggestSlug(event.target.value, L.slug), {
                        shouldDirty: true,
                      });
                    }
                  },
                })}
              />
            )}
          </FormField>

          <FormField
            id="study-slug"
            label="슬러그"
            required
            hint={
              <span className={cn(slugStatus === "available" && "text-[#1e7e34]")}>{slugHint}</span>
            }
            error={
              errors.slug?.message ?? (slugStatus === "taken" ? MESSAGES.slugTaken : undefined)
            }
            counter={{ length: values.slug?.length ?? 0, max: L.slug }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.slug}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="android-basic"
                {...register("slug", { onChange: () => setSlugEdited(true) })}
              />
            )}
          </FormField>

          <FormField
            id="study-topic"
            label="주제"
            required
            hint="카드 상단 태그로 표시됩니다."
            error={errors.topic?.message}
            counter={{ length: values.topic?.length ?? 0, max: L.topic }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.topic}
                placeholder="Android"
                {...register("topic")}
              />
            )}
          </FormField>

          <FormField
            id="study-summary"
            label="한 줄 요약"
            required
            error={errors.summary?.message}
            counter={{ length: values.summary?.length ?? 0, max: L.summary }}
          >
            {(control) => <Input {...control} maxLength={L.summary} {...register("summary")} />}
          </FormField>
        </FormSection>

        <FormSection
          title="기간"
          description="진행 상태는 입력하지 않습니다. 종료월로 자동 계산됩니다."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="study-period-start"
              label="시작"
              required
              error={errors.period?.start?.message}
            >
              {(controlProps) => (
                <Controller
                  control={control}
                  name="period.start"
                  render={({ field }) => (
                    <YearMonthSelect
                      {...controlProps}
                      ref={field.ref}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      years={years}
                      emptyYearLabel="연도"
                      monthLabel="시작 월"
                    />
                  )}
                />
              )}
            </FormField>
            <FormField
              id="study-period-end"
              label="종료"
              hint="진행 중이면 비워 두세요. 종료 예정월을 넣어도 됩니다."
              error={errors.period?.end?.message}
            >
              {(controlProps) => (
                <Controller
                  control={control}
                  name="period.end"
                  render={({ field }) => (
                    <YearMonthSelect
                      {...controlProps}
                      ref={field.ref}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      years={years}
                      emptyYearLabel="진행 중"
                      monthLabel="종료 월"
                    />
                  )}
                />
              )}
            </FormField>
          </div>
          <p className="text-sm">
            진행 상태:{" "}
            <strong className="font-semibold">
              {status === null ? "—" : STUDY_STATUS_LABELS[status]}
            </strong>
            <span className="ml-2 text-xs text-ink-muted">
              {status === "past"
                ? "과거 스터디에 표시됩니다."
                : status === "current"
                  ? "현재 스터디에 표시됩니다."
                  : ""}
            </span>
          </p>
        </FormSection>

        <FormSection
          title="사람"
          description="리더 · 참여자 이름은 멤버 목록과 연결되지 않는 문자열입니다. 입력 순서대로 표시됩니다."
        >
          <FormField
            id="study-leader"
            label="리더"
            required
            error={errors.leader?.message}
            counter={{ length: values.leader?.length ?? 0, max: L.leader }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.leader}
                placeholder="홍길동"
                {...register("leader")}
              />
            )}
          </FormField>
          <Controller
            control={control}
            name="participants"
            render={({ field, fieldState }) => (
              <TagInput
                id="study-participants"
                legend="참여자"
                hint={`리더는 빼고 입력합니다. 최대 ${L.participants.max}명, 이름 ${L.participants.itemLength}자`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.participants}
                errors={listErrors(fieldState.error)}
                placeholder="이름 입력 후 Enter"
              />
            )}
          />
        </FormSection>

        <FormSection title="진행">
          <FormField
            id="study-format"
            label="진행 방식"
            error={errors.format?.message}
            counter={{ length: values.format?.length ?? 0, max: L.format }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.format}
                placeholder="주 1회 오프라인 · 발표"
                {...register("format")}
              />
            )}
          </FormField>
        </FormSection>

        <FormSection title="결과물" description="발표 자료 · 저장소 같은 링크를 남깁니다.">
          <FormFieldset
            id="study-outputs"
            legend="결과물 링크"
            hint={`최대 ${L.outputs.max}개. 이름 ${L.outputs.labelLength}자, 주소는 http(s):// 로 시작`}
            error={listErrors(errors.outputs).message}
          >
            {outputs.fields.length > 0 && (
              <ol className="flex flex-col gap-3">
                {outputs.fields.map((output, index) => {
                  const outputErrors = errors.outputs?.[index];
                  return (
                    <li key={output.id} className="flex items-start gap-2">
                      <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <FormField
                          id={`study-outputs-${index}-label`}
                          label={`결과물 ${index + 1} 이름`}
                          error={outputErrors?.label?.message}
                          counter={{
                            length: values.outputs?.[index]?.label?.length ?? 0,
                            max: L.outputs.labelLength,
                          }}
                        >
                          {(controlProps) => (
                            <Input
                              {...controlProps}
                              maxLength={L.outputs.labelLength}
                              placeholder="발표 자료"
                              {...register(`outputs.${index}.label`)}
                            />
                          )}
                        </FormField>
                        <FormField
                          id={`study-outputs-${index}-url`}
                          label={`결과물 ${index + 1} 주소`}
                          error={outputErrors?.url?.message}
                        >
                          {(controlProps) => (
                            <Input
                              {...controlProps}
                              type="url"
                              inputMode="url"
                              maxLength={L.outputs.url}
                              placeholder="https://…"
                              {...register(`outputs.${index}.url`)}
                            />
                          )}
                        </FormField>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`결과물 ${index + 1} 삭제`}
                        onClick={() => outputs.remove(index)}
                        className="mt-7 shrink-0 text-ink-muted"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                        >
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}
            <div>
              <Button
                variant="secondary"
                disabled={outputs.fields.length >= L.outputs.max}
                onClick={() => outputs.append({ label: "", url: "" })}
              >
                + 결과물 추가
              </Button>
            </div>
          </FormFieldset>
        </FormSection>

        <FormFooter
          cancelHref={ADMIN_ROUTES.studies}
          pending={pending}
          slow={slow}
          draftSavedAt={draft.savedAt}
        />
      </form>

      <DraftRestoreDialog
        savedAt={draft.pendingDraft?.savedAt ?? null}
        stale={draft.pendingDraftIsStale}
        onRestore={() => {
          draft.restore();
          setSlugEdited(true);
        }}
        onDiscard={draft.discard}
      />
    </>
  );
}
