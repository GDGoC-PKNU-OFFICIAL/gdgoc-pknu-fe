"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type DeepPartial, useForm, useWatch } from "react-hook-form";

import DraftRestoreDialog from "@/components/admin/DraftRestoreDialog";
import FormField, { FormFieldset, FormSection } from "@/components/admin/FormField";
import FormFooter from "@/components/admin/FormFooter";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useDraft } from "@/components/admin/hooks/use-draft";
import { useLeaveWarning } from "@/components/admin/hooks/use-leave-warning";
import { useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { applyFieldErrors } from "@/components/admin/lib/apply-field-errors";
import { SETTINGS_DRAFT_KEY } from "@/components/admin/lib/draft-storage";
import Input from "@/components/ui/Input";
import { SETTING_LIMITS } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";
import { formatKstDateTime, isIsoDate } from "@/lib/date";
import type { SiteSetting, SiteStat } from "@/types/api";

import RecruitBanner from "../components/RecruitBanner";
import StatsGrid from "../components/StatsGrid";

import {
  emptySettingForm,
  type SettingFormOutput,
  type SettingFormValues,
  settingFormSchema,
  settingToForm,
  toSettingRequest,
} from "./setting-schema";

const L = SETTING_LIMITS;

const MESSAGES = {
  saved: "저장했습니다. 사이트에 곧 반영됩니다.",
  invalid: "입력값을 확인해 주세요.",
} as const;

/** 입력 중인 통계 → 미리보기. 숫자가 비었거나 음수면 0 으로 보여 준다 */
function previewStats(stats: DeepPartial<SettingFormValues>["stats"]): SiteStat[] {
  return (stats ?? []).map((stat) => ({
    label: stat?.label?.trim() || "라벨",
    value: Number.isInteger(stat?.value) && (stat?.value ?? 0) >= 0 ? (stat?.value ?? 0) : 0,
    unit: stat?.unit?.trim() || undefined,
    suffix: stat?.suffix?.trim() || undefined,
  }));
}

interface SettingsFormProps {
  /** 저장된 설정. 아직 한 번도 저장하지 않았으면 null — 빈 폼으로 시작한다 */
  setting: SiteSetting | null;
}

/**
 * A-50 사이트 설정 (IA 8-4). 모집 상태 · 배너 문구 · 모집 기간 · 활동 통계 4개를 한 번에 저장한다.
 * 오른쪽(좁은 화면은 위)에 홈 히어로 모집 상태 · 활동 통계 미리보기를 둔다.
 * 단일 레코드라 저장 후 목록으로 가지 않고 이 화면에 머문다.
 */
export default function SettingsForm({ setting }: SettingsFormProps) {
  const toast = useToast();
  const form = useForm<SettingFormValues, unknown, SettingFormOutput>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: setting ? settingToForm(setting) : emptySettingForm(),
  });
  const {
    control,
    register,
    reset,
    formState: { errors, isDirty },
  } = form;
  const values = useWatch({ control });

  const [serverUpdatedAt, setServerUpdatedAt] = useState(setting?.updatedAt ?? null);
  const draft = useDraft({ form, storageKey: SETTINGS_DRAFT_KEY, serverUpdatedAt });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  useLeaveWarning(isDirty && !pending);

  const onSubmit = form.handleSubmit(
    async (output) => {
      // 401 로 로그인에 가더라도 지금 내용이 남도록 먼저 임시 저장한다 (PRD 4-6)
      draft.saveNow();
      const result = await run(() => updateSettings(toSettingRequest(output)), {
        successMessage: MESSAGES.saved,
        onError: (error) => {
          const unmatched = applyFieldErrors(form, error.fieldErrors);
          if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
          if (error.fieldErrors.length > 0) return MESSAGES.invalid;
        },
      });
      if (!result.ok) return;
      draft.clear();
      // 저장된 값을 새 기준으로 삼는다 — 이탈 경고 · 임시 저장 비교가 새 값 기준으로 돌아간다
      reset(settingToForm(result.data));
      setServerUpdatedAt(result.data.updatedAt);
    },
    () => toast.error(MESSAGES.invalid),
  );

  const start = values.recruitPeriod?.start ?? "";
  const end = values.recruitPeriod?.end ?? "";
  const previewPeriod =
    isIsoDate(start) && isIsoDate(end) && start <= end ? { start, end } : undefined;

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {serverUpdatedAt ? (
          <p className="text-sm text-ink-muted">
            마지막 수정 {formatKstDateTime(new Date(serverUpdatedAt))}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            아직 저장된 설정이 없습니다. 저장하면 홈 화면에 반영됩니다.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <aside className="lg:sticky lg:top-6 lg:order-last lg:self-start">
            <section
              aria-labelledby="settings-preview-title"
              className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
            >
              <h2 id="settings-preview-title" className="text-base font-bold">
                홈 미리보기
              </h2>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-ink-muted">히어로 모집 상태</p>
                <RecruitBanner
                  recruiting={values.recruiting ?? false}
                  recruitPeriod={previewPeriod}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-ink-muted">활동 통계</p>
                <StatsGrid stats={previewStats(values.stats)} />
              </div>
            </section>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <FormSection title="모집 상태" description="홈 히어로의 모집 배지 · 기간에 반영됩니다.">
              <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
                <span className="flex flex-col">
                  <span className="text-sm font-medium">모집 여부</span>
                  <span className="text-xs text-ink-muted">
                    {values.recruiting ? "모집중으로 표시됩니다." : "모집 마감으로 표시됩니다."}
                  </span>
                </span>
                <span className="relative inline-flex shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    className="peer sr-only"
                    {...register("recruiting")}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-brand-blue",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-blue",
                      "after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition-transform",
                      "peer-checked:after:translate-x-5",
                    )}
                  />
                </span>
              </label>

              <FormField
                id="settings-bannerText"
                label="배너 문구"
                required
                hint="현재 홈 화면에는 표시하지 않습니다 (모집 배지 · 기간만 표시). API 필수 값이라 저장합니다."
                error={errors.bannerText?.message}
                counter={{ length: values.bannerText?.length ?? 0, max: L.bannerText }}
              >
                {(control) => (
                  <Input
                    {...control}
                    maxLength={L.bannerText}
                    placeholder="2026 2기 코어멤버 모집 중"
                    {...register("bannerText")}
                  />
                )}
              </FormField>

              <FormFieldset
                id="settings-recruitPeriod"
                legend="모집 기간"
                hint="둘 다 입력하거나 둘 다 비워 두세요. 비우면 모집 상태만 표시됩니다."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    id="settings-recruitPeriod-start"
                    label="시작일"
                    error={errors.recruitPeriod?.start?.message}
                  >
                    {(control) => (
                      <Input {...control} type="date" {...register("recruitPeriod.start")} />
                    )}
                  </FormField>
                  <FormField
                    id="settings-recruitPeriod-end"
                    label="종료일"
                    error={errors.recruitPeriod?.end?.message}
                  >
                    {(control) => (
                      <Input
                        {...control}
                        type="date"
                        min={isIsoDate(start) ? start : undefined}
                        {...register("recruitPeriod.end")}
                      />
                    )}
                  </FormField>
                </div>
              </FormFieldset>
            </FormSection>

            <FormSection
              title="활동 통계"
              description={`홈 활동 통계 ${L.stats.count}칸입니다. 순서대로 2 × 2 로 표시됩니다.`}
            >
              <ol className="flex flex-col gap-5">
                {Array.from({ length: L.stats.count }, (_, index) => {
                  const statErrors = errors.stats?.[index];
                  const stat = values.stats?.[index];
                  return (
                    <li key={index}>
                      <FormFieldset id={`settings-stats-${index}`} legend={`통계 ${index + 1}`}>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                          <FormField
                            id={`settings-stats-${index}-label`}
                            label="라벨"
                            required
                            error={statErrors?.label?.message}
                            counter={{
                              length: stat?.label?.length ?? 0,
                              max: L.stats.labelLength,
                            }}
                          >
                            {(control) => (
                              <Input
                                {...control}
                                maxLength={L.stats.labelLength}
                                {...register(`stats.${index}.label`)}
                              />
                            )}
                          </FormField>
                          <FormField
                            id={`settings-stats-${index}-value`}
                            label="숫자"
                            required
                            error={statErrors?.value?.message}
                          >
                            {(control) => (
                              <Input
                                {...control}
                                type="number"
                                inputMode="numeric"
                                min={L.stats.minValue}
                                step={1}
                                {...register(`stats.${index}.value`, { valueAsNumber: true })}
                              />
                            )}
                          </FormField>
                          <FormField
                            id={`settings-stats-${index}-unit`}
                            label="단위"
                            error={statErrors?.unit?.message}
                          >
                            {(control) => (
                              <Input
                                {...control}
                                maxLength={L.stats.unitLength}
                                placeholder="명"
                                {...register(`stats.${index}.unit`)}
                              />
                            )}
                          </FormField>
                          <FormField
                            id={`settings-stats-${index}-suffix`}
                            label="접미사"
                            error={statErrors?.suffix?.message}
                          >
                            {(control) => (
                              <Input
                                {...control}
                                maxLength={L.stats.suffixLength}
                                placeholder="+"
                                {...register(`stats.${index}.suffix`)}
                              />
                            )}
                          </FormField>
                        </div>
                      </FormFieldset>
                    </li>
                  );
                })}
              </ol>
            </FormSection>
          </div>
        </div>

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
