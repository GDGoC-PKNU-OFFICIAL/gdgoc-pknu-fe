"use client";

import { type Ref } from "react";

import Select from "@/components/ui/Select";

import { type FieldControlProps } from "./FormField";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const month = String(i + 1).padStart(2, "0");
  return { value: month, label: `${i + 1}월` };
});

/** "YYYY.MM" · "YYYY." · ".MM" · "" → [연, 월]. 고르는 중인 값도 그대로 둔다 */
function splitYearMonth(value: string): [string, string] {
  const [year = "", month = ""] = value.split(".");
  return [year, month];
}

function joinYearMonth(year: string, month: string): string {
  return year === "" && month === "" ? "" : `${year}.${month}`;
}

interface YearMonthSelectProps extends FieldControlProps {
  /** react-hook-form Controller 의 field.ref — 에러가 나면 연도 선택으로 포커스가 온다 */
  ref?: Ref<HTMLSelectElement>;
  /** "YYYY.MM". 비어 있으면 "", 연도만 고른 상태는 "YYYY." — 검증은 폼 스키마가 한다 */
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  /** 선택지 연도 (adminYears) */
  years: number[];
  /** 연도 선택의 빈 값 문구 — 시작: "연도", 종료: "진행 중" */
  emptyYearLabel: string;
  /** 스크린 리더용 월 선택 이름 (연도 선택은 바깥 <label> 이 이름이 된다) */
  monthLabel: string;
}

/**
 * 연 · 월 선택 (IA 8-4 "연 · 월 선택"). <input type="month"> 는 Safari 데스크톱이 지원하지 않아 select 두 개로 둔다.
 * 연도를 비우면 월도 함께 비운다 — 종료월에서는 "진행 중"을 뜻한다.
 */
export default function YearMonthSelect({
  ref,
  id,
  invalid,
  "aria-describedby": describedBy,
  "aria-required": ariaRequired,
  value,
  onChange,
  onBlur,
  years,
  emptyYearLabel,
  monthLabel,
}: YearMonthSelectProps) {
  const [year, month] = splitYearMonth(value);
  return (
    <div className="flex gap-2">
      <Select
        ref={ref}
        id={id}
        aria-required={ariaRequired}
        value={year}
        placeholder={emptyYearLabel}
        options={years.map((y) => ({ value: String(y), label: `${y}년` }))}
        invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => {
          const nextYear = event.target.value;
          onChange(nextYear === "" ? "" : joinYearMonth(nextYear, month));
        }}
        onBlur={onBlur}
        className="flex-1"
      />
      <Select
        aria-label={monthLabel}
        value={month}
        placeholder="월"
        options={MONTH_OPTIONS}
        disabled={year === ""}
        invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => onChange(joinYearMonth(year, event.target.value))}
        onBlur={onBlur}
        className="flex-1"
      />
    </div>
  );
}
