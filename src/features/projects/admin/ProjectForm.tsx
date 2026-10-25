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
import StringListField from "@/components/admin/StringListField";
import TagInput from "@/components/admin/TagInput";
import YearMonthSelect from "@/components/admin/YearMonthSelect";
import SafeImage from "@/components/common/SafeImage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PROJECT_CATEGORY_LABELS } from "@/constants/labels";
import { PROJECT_LIMITS, SLUG_PATTERN } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { checkProjectSlug, createProject, updateProject } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";
import { formatKstDateTime, isYearMonth, parseYearMonth } from "@/lib/date";
import { type ContentStatus, PROJECT_CATEGORIES, type Project } from "@/types/api";

import { DEFAULT_PROJECT_IMAGE, PROJECT_STATUS_LABELS } from "../lib/project-labels";

import {
  emptyProjectForm,
  type ProjectFormOutput,
  type ProjectFormValues,
  projectFormSchema,
  projectToForm,
  toProjectRequest,
} from "./project-schema";

const L = PROJECT_LIMITS;

const CATEGORY_OPTIONS = PROJECT_CATEGORIES.map((value) => ({
  value,
  label: PROJECT_CATEGORY_LABELS[value],
}));

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

interface ProjectFormProps {
  /** 수정할 프로젝트. 없으면 등록 폼 (A-12 · A-13 은 같은 폼을 쓴다 — IA 8-4) */
  project?: Project;
}

/**
 * A-12 · A-13 프로젝트 등록 · 수정 폼 (IA 8-4 · FRONT_ARCHITECTURE § 5-4).
 * react-hook-form + zod(1차 검증) + useDraft(임시 저장) + useAdminMutation(저장 · 토스트 · 401).
 * 썸네일 업로드(#28)는 presign API(BE Phase 4)가 생긴 뒤 붙인다 — 지금은 기존 썸네일 유지 · 제거만 된다.
 */
export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = project !== undefined;

  const form = useForm<ProjectFormValues, unknown, ProjectFormOutput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project ? projectToForm(project) : emptyProjectForm(),
  });
  const {
    control,
    register,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = form;
  const team = useFieldArray({ control, name: "team" });
  const values = useWatch({ control });

  const draft = useDraft({
    form,
    storageKey: draftKey("projects", project?.id ?? "new"),
    serverUpdatedAt: project?.updatedAt ?? null,
  });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  const [saved, setSaved] = useState(false);
  useLeaveWarning(isDirty && !saved);

  // 슬러그: 등록 폼에서 슬러그를 직접 고치기 전까지는 제목에서 제안한다 (IA 8-4)
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const slug = (values.slug ?? "").trim();
  const projectId = project?.id;
  const checkSlug = useCallback(
    (value: string, signal: AbortSignal) =>
      checkProjectSlug({ slug: value, excludeId: projectId }, signal).then((r) => r.available),
    [projectId],
  );
  const slugStatus = useSlugCheck(slug, {
    enabled: SLUG_PATTERN.test(slug) && slug.length <= L.slug && slug !== project?.slug,
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
      const body = toProjectRequest(output);
      const result = await run(
        () => (project ? updateProject(project.id, body) : createProject(body)),
        {
          successMessage: MESSAGES.saved,
          onError: (error) => {
            const unmatched = applyFieldErrors(form, error.fieldErrors);
            // 필드에 붙지 못한 에러(기간 전체 규칙 등)는 서버 문구를 그대로 보여 준다
            if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
            if (error.fieldErrors.length > 0) return MESSAGES.invalid;
          },
        },
      );
      if (!result.ok) return;
      setSaved(true);
      draft.clear();
      router.push(ADMIN_ROUTES.projects);
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
          : `공개 주소 /projects?project={슬러그} 에 쓰입니다. 영문 소문자 · 숫자 · 하이픈`;

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {project && (
          <p className="text-sm text-ink-muted">
            마지막 수정 {formatKstDateTime(new Date(project.updatedAt))}
          </p>
        )}

        <FormSection title="기본 정보">
          <FormField
            id="project-title"
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
            id="project-slug"
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
                placeholder="campus-map"
                {...register("slug", { onChange: () => setSlugEdited(true) })}
              />
            )}
          </FormField>

          <FormField
            id="project-summary"
            label="한 줄 요약"
            required
            error={errors.summary?.message}
            counter={{ length: values.summary?.length ?? 0, max: L.summary }}
          >
            {(control) => <Input {...control} maxLength={L.summary} {...register("summary")} />}
          </FormField>

          <FormField id="project-category" label="유형" required error={errors.category?.message}>
            {(control) => (
              <Select
                {...control}
                options={CATEGORY_OPTIONS}
                placeholder="선택해 주세요"
                {...register("category")}
              />
            )}
          </FormField>
        </FormSection>

        <FormSection
          title="기간"
          description="진행 상태는 입력하지 않습니다. 종료월로 자동 계산됩니다."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="project-period-start"
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
              id="project-period-end"
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
              {status === null ? "—" : PROJECT_STATUS_LABELS[status]}
            </strong>
            <span className="ml-2 text-xs text-ink-muted">
              {status === "past"
                ? "과거 프로젝트에 표시됩니다."
                : status === "current"
                  ? "현재 프로젝트에 표시됩니다."
                  : ""}
            </span>
          </p>
        </FormSection>

        <FormSection title="썸네일" description="비워 두면 기본 이미지가 표시됩니다.">
          <Controller
            control={control}
            name="thumbnailUrl"
            render={({ field, fieldState }) => (
              <FormFieldset
                id="project-thumbnailUrl"
                legend="썸네일 이미지 (16:9)"
                hint="이미지 업로드는 다음 작업에서 추가됩니다. 지금은 기존 썸네일을 유지하거나 제거할 수 있습니다."
                error={fieldState.error?.message}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="relative aspect-video w-full max-w-64 overflow-hidden rounded-lg border border-line bg-surface-muted">
                    <SafeImage
                      src={field.value}
                      fallbackSrc={DEFAULT_PROJECT_IMAGE}
                      alt={field.value ? "현재 썸네일" : "기본 이미지"}
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                  </div>
                  {field.value !== null && (
                    <Button variant="secondary" onClick={() => field.onChange(null)}>
                      썸네일 제거
                    </Button>
                  )}
                </div>
              </FormFieldset>
            )}
          />
        </FormSection>

        <FormSection title="소개">
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <StringListField
                id="project-description"
                legend="프로젝트 소개"
                required
                hint={`문단 ${L.description.min}~${L.description.max}개, 문단당 ${L.description.itemLength.toLocaleString()}자`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.description}
                errors={listErrors(fieldState.error)}
                itemLabel={(i) => `소개 ${i + 1}문단`}
                addLabel="문단 추가"
                multiline
              />
            )}
          />
        </FormSection>

        <FormSection
          title="팀"
          description="팀원 이름은 멤버 목록과 연결되지 않는 문자열입니다. 입력 순서대로 표시됩니다."
        >
          <FormFieldset
            id="project-team"
            legend="팀원"
            hint={`최대 ${L.team.max}명, 이름 · 역할 각 ${L.team.itemLength}자`}
            error={listErrors(errors.team).message}
          >
            {team.fields.length > 0 && (
              <ol className="flex flex-col gap-3">
                {team.fields.map((member, index) => {
                  const memberErrors = errors.team?.[index];
                  return (
                    <li key={member.id} className="flex items-start gap-2">
                      <div className="grid flex-1 gap-2 sm:grid-cols-2">
                        <FormField
                          id={`project-team-${index}-name`}
                          label={`팀원 ${index + 1} 이름`}
                          error={memberErrors?.name?.message}
                          counter={{
                            length: values.team?.[index]?.name?.length ?? 0,
                            max: L.team.itemLength,
                          }}
                        >
                          {(controlProps) => (
                            <Input
                              {...controlProps}
                              maxLength={L.team.itemLength}
                              placeholder="홍길동"
                              {...register(`team.${index}.name`)}
                            />
                          )}
                        </FormField>
                        <FormField
                          id={`project-team-${index}-role`}
                          label={`팀원 ${index + 1} 역할`}
                          error={memberErrors?.role?.message}
                          counter={{
                            length: values.team?.[index]?.role?.length ?? 0,
                            max: L.team.itemLength,
                          }}
                        >
                          {(controlProps) => (
                            <Input
                              {...controlProps}
                              maxLength={L.team.itemLength}
                              placeholder="프론트엔드"
                              {...register(`team.${index}.role`)}
                            />
                          )}
                        </FormField>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`팀원 ${index + 1} 삭제`}
                        onClick={() => team.remove(index)}
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
                disabled={team.fields.length >= L.team.max}
                onClick={() => team.append({ name: "", role: "" })}
              >
                + 팀원 추가
              </Button>
            </div>
          </FormFieldset>
        </FormSection>

        <FormSection title="내용">
          <Controller
            control={control}
            name="techStack"
            render={({ field, fieldState }) => (
              <TagInput
                id="project-techStack"
                legend="기술 스택"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.techStack}
                errors={listErrors(fieldState.error)}
                placeholder="Next.js"
              />
            )}
          />
          <Controller
            control={control}
            name="features"
            render={({ field, fieldState }) => (
              <StringListField
                id="project-features"
                legend="주요 기능"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.features}
                errors={listErrors(fieldState.error)}
                itemLabel={(i) => `주요 기능 ${i + 1}`}
                addLabel="기능 추가"
              />
            )}
          />
          <Controller
            control={control}
            name="outcomes"
            render={({ field, fieldState }) => (
              <StringListField
                id="project-outcomes"
                legend={status === "past" ? "결과" : "결과 / 목표"}
                hint={`진행 중인 프로젝트는 공개 화면에서 "목표"로 표시됩니다. 최대 ${L.outcomes.max}개, 항목당 ${L.outcomes.itemLength}자`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.outcomes}
                errors={listErrors(fieldState.error)}
                itemLabel={(i) => `결과 ${i + 1}`}
                addLabel="결과 추가"
              />
            )}
          />
        </FormSection>

        <FormSection title="링크" description="없는 링크는 공개 화면에서 버튼이 숨겨집니다.">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="project-links-github"
              label="GitHub"
              error={errors.links?.github?.message}
              counter={{ length: values.links?.github?.length ?? 0, max: L.url }}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  type="url"
                  inputMode="url"
                  maxLength={L.url}
                  placeholder="https://github.com/…"
                  {...register("links.github")}
                />
              )}
            </FormField>
            <FormField
              id="project-links-demo"
              label="데모"
              error={errors.links?.demo?.message}
              counter={{ length: values.links?.demo?.length ?? 0, max: L.url }}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  type="url"
                  inputMode="url"
                  maxLength={L.url}
                  placeholder="https://…"
                  {...register("links.demo")}
                />
              )}
            </FormField>
          </div>
        </FormSection>

        <FormFooter
          cancelHref={ADMIN_ROUTES.projects}
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
