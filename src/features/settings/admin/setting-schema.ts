// src/features/settings/admin/setting-schema.ts
// 사이트 설정 폼 (A-50) 의 값 모양 · 1차 검증 · 요청 변환 (API 명세서 4-7, FRONT_ARCHITECTURE § 5-4).
//
// 폼 값 모양은 요청(SettingRequest)과 같은 경로를 쓴다 — Spring fieldErrors 의 "stats[0].value" ·
// "recruitPeriod.end" 가 그대로 폼 필드에 붙는다. 비운 칸은 폼에서 "", 요청에서 null 이다 (명세 1-4).
// 통계는 정확히 4칸이라 추가 · 삭제 없이 고정 4행으로 둔다.

import { z } from "zod";

import { SETTING_LIMITS } from "@/constants/limits";
import { isIsoDate } from "@/lib/date";
import type { SiteSetting } from "@/types/api";
import type { SettingRequest } from "@/types/request";

const L = SETTING_LIMITS;

const MESSAGES = {
  required: "필수 입력 항목입니다.",
  maxLength: (max: number) => `${max}자 이하로 입력해 주세요.`,
  value: "0 이상의 정수를 입력해 주세요.",
  periodBoth: "모집 기간은 시작일 · 종료일을 모두 입력하거나 모두 비워 주세요.",
  periodOrder: "종료일은 시작일과 같거나 그 이후여야 합니다.",
  date: "날짜 형식이 올바르지 않습니다.",
  statsCount: `통계는 정확히 ${L.stats.count}개여야 합니다.`,
} as const;

const optionalDate = z.string().refine((value) => value === "" || isIsoDate(value), MESSAGES.date);

const optionalText = (max: number) => z.string().trim().max(max, MESSAGES.maxLength(max));

const statSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(L.stats.labelLength, MESSAGES.maxLength(L.stats.labelLength)),
  // 숫자 입력칸은 valueAsNumber 라 비우면 NaN — 같은 문구로 안내한다
  value: z
    .number({ error: MESSAGES.value })
    .int(MESSAGES.value)
    .min(L.stats.minValue, MESSAGES.value),
  unit: optionalText(L.stats.unitLength),
  suffix: optionalText(L.stats.suffixLength),
});

export const settingFormSchema = z.object({
  recruiting: z.boolean(),
  bannerText: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .max(L.bannerText, MESSAGES.maxLength(L.bannerText)),
  recruitPeriod: z
    .object({ start: optionalDate, end: optionalDate })
    .superRefine(({ start, end }, ctx) => {
      if ((start === "") !== (end === "")) {
        ctx.addIssue({
          code: "custom",
          path: [start === "" ? "start" : "end"],
          message: MESSAGES.periodBoth,
        });
      } else if (isIsoDate(start) && isIsoDate(end) && end < start) {
        ctx.addIssue({ code: "custom", path: ["end"], message: MESSAGES.periodOrder });
      }
    }),
  stats: z.array(statSchema).length(L.stats.count, MESSAGES.statsCount),
});

/** 폼이 들고 있는 값 (입력 중 · 임시 저장본) */
export type SettingFormValues = z.input<typeof settingFormSchema>;
/** 검증을 통과해 앞뒤 공백까지 정리된 값 */
export type SettingFormOutput = z.output<typeof settingFormSchema>;

/** 아직 저장된 설정이 없을 때의 초기값. 통계 라벨은 IA 8-4 A-50 예시를 채워 둔다 */
export function emptySettingForm(): SettingFormValues {
  const labels = ["운영 기수", "누적 멤버", "완료 프로젝트", "세션 · 이벤트"];
  return {
    recruiting: false,
    bannerText: "",
    recruitPeriod: { start: "", end: "" },
    stats: labels.map((label) => ({ label, value: 0, unit: "", suffix: "" })),
  };
}

/** 수정 폼 초기값. 통계가 4개보다 적게 저장돼 있으면(옛 데이터) 빈 칸으로 4개를 맞춘다 */
export function settingToForm(setting: SiteSetting): SettingFormValues {
  const stats = setting.stats.slice(0, L.stats.count).map((stat) => ({
    label: stat.label,
    value: stat.value,
    unit: stat.unit ?? "",
    suffix: stat.suffix ?? "",
  }));
  while (stats.length < L.stats.count) stats.push({ label: "", value: 0, unit: "", suffix: "" });
  return {
    recruiting: setting.recruiting,
    bannerText: setting.bannerText,
    recruitPeriod: {
      start: setting.recruitPeriod?.start ?? "",
      end: setting.recruitPeriod?.end ?? "",
    },
    stats,
  };
}

/** 요청 본문. 모든 필드를 보내고, 비운 값은 null (명세 1-4) */
export function toSettingRequest(values: SettingFormOutput): SettingRequest {
  const { start, end } = values.recruitPeriod;
  return {
    recruiting: values.recruiting,
    bannerText: values.bannerText,
    recruitPeriod: start && end ? { start, end } : null,
    stats: values.stats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      unit: stat.unit || null,
      suffix: stat.suffix || null,
    })),
  };
}
