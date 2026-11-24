"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";

import DraftRestoreDialog from "@/components/admin/DraftRestoreDialog";
import FormField, { FormSection } from "@/components/admin/FormField";
import FormFooter from "@/components/admin/FormFooter";
import ActivityPoster from "@/components/common/ActivityPoster";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useDraft } from "@/components/admin/hooks/use-draft";
import { useLeaveWarning } from "@/components/admin/hooks/use-leave-warning";
import { useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import ImageUploadField, { type UploadStatus } from "@/components/admin/ImageUploadField";
import { applyFieldErrors } from "@/components/admin/lib/apply-field-errors";
import { ABOUT_DRAFT_KEY } from "@/components/admin/lib/draft-storage";
import { listErrors } from "@/components/admin/lib/list-errors";
import StringListField from "@/components/admin/StringListField";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { updateAbout } from "@/lib/api/admin-api";
import { formatKstDateTime } from "@/lib/date";
import {
  ABOUT_ACTIVITY_GROUPS,
  ABOUT_ACTIVITY_LAYOUTS,
  ABOUT_ACTIVITY_TONES,
  type AboutActivityLayout,
  type AboutContent,
  RULE_ICONS,
} from "@/types/api";

import { ACTIVITY_GROUP_LABELS, TONE_LABELS, toPosterActivity } from "../lib/about-content";

import {
  ABOUT_LIMITS,
  type AboutFormOutput,
  type AboutFormValues,
  aboutFormSchema,
  aboutToForm,
  emptyActivity,
  LAYOUTS_WITH_IMAGE,
  LAYOUTS_WITH_POSITION,
  toAboutRequest,
} from "./about-schema";

const L = ABOUT_LIMITS;

const MESSAGES = {
  saved: "저장했습니다. About · 홈에 곧 반영됩니다.",
  invalid: "입력값을 확인해 주세요.",
  uploading: "이미지 업로드가 끝난 뒤 저장해 주세요.",
} as const;

const LAYOUT_LABELS = {
  color: "색 카드 (사진 없음)",
  cover: "사진 가득",
  square: "위쪽 정사각형 사진",
  top: "글자 위쪽만 사진",
  artwork: "색 카드 위 그림",
  logo: "색 카드 위 로고",
  circles: "원형 사진 두 장",
} satisfies Record<AboutActivityLayout, string>;

const RULE_ICON_LABELS = { book: "책", person: "사람", badge: "배지" } as const;

const GROUP_OPTIONS = ABOUT_ACTIVITY_GROUPS.map((value) => ({
  value,
  label: ACTIVITY_GROUP_LABELS[value],
}));
const LAYOUT_OPTIONS = ABOUT_ACTIVITY_LAYOUTS.map((value) => ({
  value,
  label: LAYOUT_LABELS[value],
}));
const TONE_OPTIONS = ABOUT_ACTIVITY_TONES.map((value) => ({ value, label: TONE_LABELS[value] }));
const ICON_OPTIONS = RULE_ICONS.map((value) => ({ value, label: RULE_ICON_LABELS[value] }));

const MARKDOWN_HELP =
  "## 소제목 · 일반 문단 · - 목록 (두 칸 들여 쓰면 하위 목록) · 1. 번호 목록 · **굵게** · > 맨 위 안내 상자 / 맨 끝 강조 문구";

interface AboutFormProps {
  /** 저장된 내용. 저장한 적이 없으면 코드 기본 내용을 넘기고 saved=false */
  about: AboutContent;
  saved: boolean;
}

/**
 * About 수정 (단일 레코드). 구역마다 표처럼 한 줄씩 쌓고, 줄마다 위 · 아래 이동과 삭제가 있다.
 * 저장하면 BFF 가 / · /about 을 재검증한다. 저장 후 이 화면에 머문다.
 */
export default function AboutForm({ about, saved }: AboutFormProps) {
  const toast = useToast();
  const form = useForm<AboutFormValues, unknown, AboutFormOutput>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: aboutToForm(about),
  });
  const {
    control,
    register,
    reset,
    formState: { errors, isDirty },
  } = form;
  const values = useWatch({ control });

  const activities = useFieldArray({ control, name: "activities" });
  const rules = useFieldArray({ control, name: "rules" });
  const faq = useFieldArray({ control, name: "faq" });

  const [serverUpdatedAt, setServerUpdatedAt] = useState(saved ? (about.updatedAt ?? null) : null);
  const draft = useDraft({ form, storageKey: ABOUT_DRAFT_KEY, serverUpdatedAt });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  useLeaveWarning(isDirty && !pending);

  // 업로드 칸이 여러 개라 칸마다 상태를 모아 둔다
  const [uploads, setUploads] = useState<Record<string, UploadStatus>>({});
  const onUploadStatus = useCallback(
    (key: string) => (status: UploadStatus) => setUploads((prev) => ({ ...prev, [key]: status })),
    [],
  );
  const busy = Object.values(uploads).some((status) => status !== "idle");

  const onSubmit = form.handleSubmit(
    async (output) => {
      if (busy) {
        toast.error(MESSAGES.uploading);
        return;
      }
      draft.saveNow();
      const result = await run(() => updateAbout(toAboutRequest(output)), {
        successMessage: MESSAGES.saved,
        onError: (error) => {
          const unmatched = applyFieldErrors(form, error.fieldErrors);
          if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
          if (error.fieldErrors.length > 0) return MESSAGES.invalid;
        },
      });
      if (!result.ok) return;
      draft.clear();
      reset(aboutToForm(result.data));
      setServerUpdatedAt(result.data.updatedAt ?? null);
    },
    () => toast.error(MESSAGES.invalid),
  );

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        <p className="text-sm text-ink-muted">
          {serverUpdatedAt
            ? `마지막 수정 ${formatKstDateTime(new Date(serverUpdatedAt))}`
            : "아직 저장한 적이 없어 지금 사이트에 보이는 기본 내용을 채워 두었습니다. 저장하면 이 내용으로 바뀝니다."}
        </p>

        {/* ── Who We Are ── */}
        <FormSection
          title="Who We Are"
          description="About 맨 위 소개 문단입니다. 문단 안에서 줄을 바꾸면 화면에서도 줄이 바뀝니다."
        >
          <Controller
            control={control}
            name="identity"
            render={({ field, fieldState }) => (
              <StringListField
                id="about-identity"
                legend="소개 문단"
                required
                hint={`문단 ${L.identity.min}~${L.identity.max}개, 문단당 ${L.identity.itemLength.toLocaleString()}자`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                limits={L.identity}
                errors={listErrors(fieldState.error)}
                itemLabel={(i) => `소개 ${i + 1}문단`}
                addLabel="문단 추가"
                multiline
              />
            )}
          />
        </FormSection>

        {/* ── What We Do ── */}
        <FormSection
          title={`What We Do 활동 카드 (${activities.fields.length}/${L.activities.max})`}
          description="'GDGoC PKNU 활동' 묶음은 홈 What We Do 에도 같은 순서로 보입니다. 위 · 아래 버튼으로 순서를 바꿉니다."
        >
          <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line">
            {activities.fields.map((field, index) => {
              const item = values.activities?.[index];
              const layout = (item?.layout ?? "color") as AboutActivityLayout;
              const itemErrors = errors.activities?.[index];
              return (
                <li key={field.id} className="flex flex-col gap-4 bg-surface p-4">
                  <RowHeader
                    index={index}
                    total={activities.fields.length}
                    title={item?.title || "(제목 없음)"}
                    meta={`${ACTIVITY_GROUP_LABELS[item?.group ?? "activity"]} · ${LAYOUT_LABELS[layout]}`}
                    onMove={(to) => activities.move(index, to)}
                    onRemove={() => activities.remove(index)}
                    removeDisabled={activities.fields.length <= L.activities.min}
                  />
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                    {/* 이 카드가 About · 홈에 보일 모습 (입력하는 대로 바뀐다) */}
                    <div className="lg:order-last">
                      <p className="mb-1.5 text-xs font-medium text-ink-muted">미리보기</p>
                      <div inert className="pointer-events-none w-48 select-none lg:w-full">
                        <ActivityPoster
                          activity={toPosterActivity(previewActivity(item))}
                          eyebrow={ACTIVITY_GROUP_LABELS[item?.group ?? "activity"]}
                          index={index}
                        />
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-col gap-4">
                      <div className="grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))]">
                        <SelectField
                          id={`about-activities-${index}-group`}
                          label="묶음"
                          options={GROUP_OPTIONS}
                          register={register}
                          name={`activities.${index}.group`}
                        />
                        <SelectField
                          id={`about-activities-${index}-layout`}
                          label="카드 모양"
                          options={LAYOUT_OPTIONS}
                          register={register}
                          name={`activities.${index}.layout`}
                        />
                        <SelectField
                          id={`about-activities-${index}-tone`}
                          label="바탕색"
                          options={TONE_OPTIONS}
                          register={register}
                          name={`activities.${index}.tone`}
                        />
                        <TextField
                          id={`about-activities-${index}-cadence`}
                          label="주기"
                          max={L.activities.cadenceLength}
                          register={register}
                          name={`activities.${index}.cadence`}
                          error={itemErrors?.cadence?.message}
                        />
                      </div>
                      <TextField
                        id={`about-activities-${index}-title`}
                        label="제목"
                        max={L.activities.titleLength}
                        register={register}
                        name={`activities.${index}.title`}
                        error={itemErrors?.title?.message}
                      />
                      <FormField
                        id={`about-activities-${index}-description`}
                        label="설명"
                        required
                        error={itemErrors?.description?.message}
                        counter={{
                          length: item?.description?.length ?? 0,
                          max: L.activities.descriptionLength,
                        }}
                      >
                        {(control) => (
                          <Textarea
                            {...control}
                            rows={2}
                            maxLength={L.activities.descriptionLength}
                            {...register(`activities.${index}.description`)}
                          />
                        )}
                      </FormField>
                      {(LAYOUTS_WITH_IMAGE as readonly string[]).includes(layout) && (
                        <div className="flex flex-wrap gap-6">
                          <Controller
                            control={control}
                            name={`activities.${index}.imageUrl`}
                            render={({ field: image, fieldState }) => (
                              <ImageUploadField
                                id={`about-activities-${index}-imageUrl`}
                                legend={layout === "circles" ? "큰 원 사진" : "사진 · 그림"}
                                target="about"
                                value={image.value}
                                onChange={image.onChange}
                                onBlur={image.onBlur}
                                ref={image.ref}
                                fallbackSrc="/images/default-project.png"
                                aspect="square"
                                error={fieldState.error?.message}
                                onStatusChange={onUploadStatus(`${field.id}-1`)}
                                onBeforeUpload={draft.saveNow}
                              />
                            )}
                          />
                          {layout === "circles" && (
                            <Controller
                              control={control}
                              name={`activities.${index}.secondImageUrl`}
                              render={({ field: image, fieldState }) => (
                                <ImageUploadField
                                  id={`about-activities-${index}-secondImageUrl`}
                                  legend="작은 원 사진"
                                  target="about"
                                  value={image.value}
                                  onChange={image.onChange}
                                  onBlur={image.onBlur}
                                  ref={image.ref}
                                  fallbackSrc="/images/default-project.png"
                                  aspect="square"
                                  error={fieldState.error?.message}
                                  onStatusChange={onUploadStatus(`${field.id}-2`)}
                                  onBeforeUpload={draft.saveNow}
                                />
                              )}
                            />
                          )}
                          {(LAYOUTS_WITH_POSITION as readonly string[]).includes(layout) && (
                            <TextField
                              id={`about-activities-${index}-imagePosition`}
                              label="사진에서 보일 중심"
                              optional
                              hint="비우면 가운데. 예: 35% 50%"
                              max={9}
                              register={register}
                              name={`activities.${index}.imagePosition`}
                              error={itemErrors?.imagePosition?.message}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <AddButton
            label="카드 추가"
            disabled={activities.fields.length >= L.activities.max}
            onClick={() => activities.append(emptyActivity())}
          />
          {errors.activities?.root?.message && (
            <p className="text-xs text-brand-red">{errors.activities.root.message}</p>
          )}
        </FormSection>

        {/* ── 활동 규칙 ── */}
        <FormSection
          title={`활동 규칙 문서 (${rules.fields.length}/${L.rules.max})`}
          description="블록을 누르면 열리는 규칙 문서입니다. 주소(slug)는 공유 링크(?rule=)에 쓰여 겹칠 수 없습니다."
        >
          <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line">
            {rules.fields.map((field, index) => {
              const item = values.rules?.[index];
              const itemErrors = errors.rules?.[index];
              return (
                <li key={field.id} className="flex flex-col gap-4 bg-surface p-4">
                  <RowHeader
                    index={index}
                    total={rules.fields.length}
                    title={item?.title || "(제목 없음)"}
                    meta={`?rule=${item?.slug ?? ""}`}
                    onMove={(to) => rules.move(index, to)}
                    onRemove={() => rules.remove(index)}
                  />
                  <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]">
                    <TextField
                      id={`about-rules-${index}-title`}
                      label="제목"
                      max={L.rules.titleLength}
                      register={register}
                      name={`rules.${index}.title`}
                      error={itemErrors?.title?.message}
                    />
                    <TextField
                      id={`about-rules-${index}-slug`}
                      label="주소 (slug)"
                      max={L.rules.slugLength}
                      register={register}
                      name={`rules.${index}.slug`}
                      error={itemErrors?.slug?.message}
                    />
                    <SelectField
                      id={`about-rules-${index}-icon`}
                      label="아이콘"
                      options={ICON_OPTIONS}
                      register={register}
                      name={`rules.${index}.icon`}
                    />
                  </div>
                  <FormField
                    id={`about-rules-${index}-body`}
                    label="본문 (마크다운)"
                    required
                    hint={MARKDOWN_HELP}
                    error={itemErrors?.body?.message}
                    counter={{ length: item?.body?.length ?? 0, max: L.rules.bodyLength }}
                  >
                    {(control) => (
                      <Textarea
                        {...control}
                        rows={10}
                        maxLength={L.rules.bodyLength}
                        className="font-mono text-sm"
                        {...register(`rules.${index}.body`)}
                      />
                    )}
                  </FormField>
                </li>
              );
            })}
          </ol>
          <AddButton
            label="규칙 문서 추가"
            disabled={rules.fields.length >= L.rules.max}
            onClick={() => rules.append({ slug: "", title: "", icon: "book", body: "" })}
          />
        </FormSection>

        {/* ── FAQ ── */}
        <FormSection
          title={`FAQ (${faq.fields.length}/${L.faq.max})`}
          description="About 맨 아래 질문 · 답변입니다."
        >
          <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line">
            {faq.fields.map((field, index) => {
              const item = values.faq?.[index];
              const itemErrors = errors.faq?.[index];
              return (
                <li key={field.id} className="flex flex-col gap-3 bg-surface p-4">
                  <RowHeader
                    index={index}
                    total={faq.fields.length}
                    title={item?.question || "(질문 없음)"}
                    onMove={(to) => faq.move(index, to)}
                    onRemove={() => faq.remove(index)}
                  />
                  <TextField
                    id={`about-faq-${index}-question`}
                    label="질문"
                    max={L.faq.questionLength}
                    register={register}
                    name={`faq.${index}.question`}
                    error={itemErrors?.question?.message}
                  />
                  <FormField
                    id={`about-faq-${index}-answer`}
                    label="답변"
                    required
                    error={itemErrors?.answer?.message}
                    counter={{ length: item?.answer?.length ?? 0, max: L.faq.answerLength }}
                  >
                    {(control) => (
                      <Textarea
                        {...control}
                        rows={3}
                        maxLength={L.faq.answerLength}
                        {...register(`faq.${index}.answer`)}
                      />
                    )}
                  </FormField>
                </li>
              );
            })}
          </ol>
          <AddButton
            label="질문 추가"
            disabled={faq.fields.length >= L.faq.max}
            onClick={() => faq.append({ question: "", answer: "" })}
          />
        </FormSection>

        <FormFooter
          cancelHref={ADMIN_ROUTES.dashboard}
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

// ───────────────────────────── 작은 부품 ─────────────────────────────

/** 입력 중인 카드 → 포스터 미리보기 (빈 칸은 자리 표시 글자, 사진이 아직 없으면 색 카드) */
function previewActivity(item: Partial<AboutFormValues["activities"][number]> | undefined) {
  return {
    group: item?.group ?? "activity",
    title: item?.title?.trim() || "카드 제목",
    cadence: item?.cadence?.trim() || "주기",
    description: item?.description?.trim() || "설명이 여기에 보입니다.",
    layout: item?.layout ?? "color",
    imageUrl: item?.imageUrl ?? undefined,
    secondImageUrl: item?.secondImageUrl ?? undefined,
    imagePosition: item?.imagePosition?.trim() || undefined,
    tone: item?.tone ?? "auto",
  } as const;
}

type Register = UseFormRegister<AboutFormValues>;
type FieldName = Parameters<Register>[0];

/** 줄 머리 — 번호 · 제목 · 보조 정보 · 위/아래/삭제 */
function RowHeader({
  index,
  total,
  title,
  meta,
  onMove,
  onRemove,
  removeDisabled,
}: {
  index: number;
  total: number;
  title: string;
  meta?: string;
  onMove: (to: number) => void;
  onRemove: () => void;
  removeDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-semibold tabular-nums">
        {index + 1}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">{title}</span>
        {meta && <span className="truncate text-xs text-ink-muted">{meta}</span>}
      </span>
      <span className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          className="min-h-9 px-2.5"
          aria-label={`${index + 1}번 위로`}
          disabled={index === 0}
          onClick={() => onMove(index - 1)}
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-9 px-2.5"
          aria-label={`${index + 1}번 아래로`}
          disabled={index === total - 1}
          onClick={() => onMove(index + 1)}
        >
          ↓
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-9 px-2.5 text-brand-red"
          disabled={removeDisabled}
          onClick={onRemove}
        >
          삭제
        </Button>
      </span>
    </div>
  );
}

function TextField({
  id,
  label,
  max,
  register,
  name,
  error,
  hint,
  optional,
}: {
  id: string;
  label: string;
  max: number;
  register: Register;
  name: FieldName;
  error?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <FormField id={id} label={label} required={!optional} hint={hint} error={error}>
      {(control) => <Input {...control} maxLength={max} {...register(name)} />}
    </FormField>
  );
}

function SelectField({
  id,
  label,
  options,
  register,
  name,
}: {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
  register: Register;
  name: FieldName;
}) {
  return (
    <FormField id={id} label={label} required>
      {(control) => <Select {...control} options={options} {...register(name)} />}
    </FormField>
  );
}

function AddButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="self-start"
      disabled={disabled}
      onClick={onClick}
    >
      + {label}
    </Button>
  );
}
