"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import DraftRestoreDialog from "@/components/admin/DraftRestoreDialog";
import FormField, { FormSection } from "@/components/admin/FormField";
import FormFooter from "@/components/admin/FormFooter";
import { useAdminMutation } from "@/components/admin/hooks/use-admin-mutation";
import { useDraft } from "@/components/admin/hooks/use-draft";
import { useLeaveWarning } from "@/components/admin/hooks/use-leave-warning";
import { useSlowNotice } from "@/components/admin/hooks/use-slow-notice";
import { applyFieldErrors } from "@/components/admin/lib/apply-field-errors";
import { draftKey } from "@/components/admin/lib/draft-storage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { EVENT_CATEGORY_LABELS } from "@/constants/labels";
import { EVENT_LIMITS } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { createEvent, updateEvent } from "@/lib/api/admin-api";
import { cn } from "@/lib/cn";
import { formatKstDateTime, isIsoDate } from "@/lib/date";
import { EVENT_CATEGORIES, type EventCategory, type EventItem } from "@/types/api";

import { EVENT_CATEGORY_STYLES, formatEventDate } from "../lib/event-labels";

import {
  emptyEventForm,
  type EventFormOutput,
  type EventFormValues,
  eventFormSchema,
  eventToForm,
  toEventRequest,
} from "./event-schema";

const L = EVENT_LIMITS;

const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((value) => ({
  value,
  label: EVENT_CATEGORY_LABELS[value],
}));

const MESSAGES = {
  saved: "저장했습니다. 사이트에 곧 반영됩니다.",
  invalid: "입력값을 확인해 주세요.",
} as const;

function isEventCategory(value: string | undefined): value is EventCategory {
  return (EVENT_CATEGORIES as readonly (string | undefined)[]).includes(value);
}

interface EventFormProps {
  /** 수정할 일정. 없으면 등록 폼 (A-32 · A-33 은 같은 폼을 쓴다 — IA 8-4) */
  event?: EventItem;
}

/**
 * A-32 · A-33 일정 등록 · 수정 폼 (IA 8-4 · FRONT_ARCHITECTURE § 5-4).
 * 같은 날 순서는 폼이 아니라 목록(A-31)에서 바꾼다. 새 일정 · 날짜를 바꾼 일정은 그 날짜의 맨 뒤로 간다 (명세 2-6).
 */
export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<EventFormValues, unknown, EventFormOutput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? eventToForm(event) : emptyEventForm(),
  });
  const {
    control,
    register,
    formState: { errors, isDirty },
  } = form;
  const values = useWatch({ control });

  const draft = useDraft({
    form,
    storageKey: draftKey("events", event?.id ?? "new"),
    serverUpdatedAt: event?.updatedAt ?? null,
  });
  const { run, pending } = useAdminMutation();
  const slow = useSlowNotice(pending);
  const [saved, setSaved] = useState(false);
  useLeaveWarning(isDirty && !saved);

  const onSubmit = form.handleSubmit(
    async (output) => {
      // 401 로 로그인에 가더라도 지금 내용이 남도록 먼저 임시 저장한다 (PRD 4-6)
      draft.saveNow();
      const body = toEventRequest(output);
      const result = await run(() => (event ? updateEvent(event.id, body) : createEvent(body)), {
        successMessage: MESSAGES.saved,
        onError: (error) => {
          const unmatched = applyFieldErrors(form, error.fieldErrors);
          if (unmatched.length > 0) return unmatched.map(({ message }) => message).join(" ");
          if (error.fieldErrors.length > 0) return MESSAGES.invalid;
        },
      });
      if (!result.ok) return;
      setSaved(true);
      draft.clear();
      router.push(ADMIN_ROUTES.events);
    },
    () => toast.error(MESSAGES.invalid),
  );

  const category = isEventCategory(values.category) ? values.category : null;
  const date = values.date ?? "";
  const endDate = values.endDate ?? "";
  const dateMoved = event !== undefined && isIsoDate(date) && date !== event.date;

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {event && (
          <p className="text-sm text-ink-muted">
            마지막 수정 {formatKstDateTime(new Date(event.updatedAt))}
          </p>
        )}

        <FormSection title="기본 정보">
          <FormField
            id="event-title"
            label="제목"
            required
            error={errors.title?.message}
            counter={{ length: values.title?.length ?? 0, max: L.title }}
          >
            {(control) => <Input {...control} maxLength={L.title} {...register("title")} />}
          </FormField>

          <FormField
            id="event-category"
            label="카테고리"
            required
            hint={
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full",
                    category ? EVENT_CATEGORY_STYLES[category].dot : "bg-line",
                  )}
                />
                {category ? `캘린더에 이 색으로 표시됩니다.` : "카테고리마다 캘린더 색이 다릅니다."}
              </span>
            }
            error={errors.category?.message}
          >
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
          title="날짜 · 시간"
          description="하루짜리 일정은 종료일을 비워 두세요. 같은 날 순서는 목록에서 바꿉니다."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="event-date" label="시작일" required error={errors.date?.message}>
              {(control) => <Input {...control} type="date" {...register("date")} />}
            </FormField>
            <FormField
              id="event-endDate"
              label="종료일"
              hint="여러 날 이어지는 일정만 입력합니다."
              error={errors.endDate?.message}
            >
              {(control) => (
                <Input
                  {...control}
                  type="date"
                  min={isIsoDate(date) ? date : undefined}
                  {...register("endDate")}
                />
              )}
            </FormField>
          </div>
          {isIsoDate(date) && (
            <p className="text-sm">
              표시:{" "}
              <strong className="font-semibold">
                {formatEventDate({
                  date,
                  endDate: isIsoDate(endDate) ? endDate : undefined,
                })}
              </strong>
              {dateMoved && (
                <span className="ml-2 text-xs text-ink-muted">
                  날짜를 바꾸면 새 날짜의 맨 뒤 순서로 갑니다.
                </span>
              )}
            </p>
          )}
          <FormField
            id="event-time"
            label="시간"
            error={errors.time?.message}
            counter={{ length: values.time?.length ?? 0, max: L.time }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.time}
                placeholder="19:00–21:00"
                {...register("time")}
              />
            )}
          </FormField>
        </FormSection>

        <FormSection title="상세">
          <FormField
            id="event-place"
            label="장소"
            error={errors.place?.message}
            counter={{ length: values.place?.length ?? 0, max: L.place }}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={L.place}
                placeholder="부경대 대연캠퍼스 ○○관"
                {...register("place")}
              />
            )}
          </FormField>
          <FormField
            id="event-summary"
            label="한 줄 요약"
            error={errors.summary?.message}
            counter={{ length: values.summary?.length ?? 0, max: L.summary }}
          >
            {(control) => <Input {...control} maxLength={L.summary} {...register("summary")} />}
          </FormField>
        </FormSection>

        <FormFooter
          cancelHref={ADMIN_ROUTES.events}
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
