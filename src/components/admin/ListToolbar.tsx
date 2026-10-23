"use client";

import { type FormEvent, type ReactNode } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ListToolbarProps {
  /** 검색창 라벨 (스크린 리더) · placeholder. 검색 대상은 리소스마다 다르다 (명세 2장) */
  searchLabel: string;
  searchPlaceholder: string;
  /** 지금 적용된 검색어 (URL 의 q) */
  query: string;
  onSearch: (query: string) => void;
  /** 상태 · 유형 · 연도 등 필터 select */
  children?: ReactNode;
}

/**
 * 관리자 목록 상단 (IA 8-3 "[검색창] [상태 필터 ▾] [연도 필터 ▾]").
 * 검색은 Enter · 검색 버튼으로 적용하고, 필터는 고르는 즉시 적용한다 (필터 onChange 는 호출하는 쪽이 정한다).
 */
export default function ListToolbar({
  searchLabel,
  searchPlaceholder,
  query,
  onSearch,
  children,
}: ListToolbarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    onSearch(typeof value === "string" ? value.trim() : "");
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <form role="search" onSubmit={handleSubmit} className="flex gap-2 lg:w-80">
        <Input
          // URL 의 q 가 바뀌면(뒤로 가기 · 필터 초기화) 입력칸도 맞춘다
          key={query}
          name="q"
          type="search"
          defaultValue={query}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
        />
        <Button type="submit" variant="secondary">
          검색
        </Button>
      </form>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
