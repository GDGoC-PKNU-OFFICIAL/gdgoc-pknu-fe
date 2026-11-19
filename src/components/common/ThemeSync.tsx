"use client";

import { useEffect } from "react";

import { applyTheme, readStoredTheme } from "@/lib/theme";

/**
 * 영역별 테마 맞추기. 페이지를 옮겨도 <html> 은 그대로라, 영역 레이아웃이 뜰 때마다 다시 맞춘다.
 * - public: 고른 테마(저장값)를 적용한다
 * - admin: 관리자 화면은 항상 라이트다
 */
export default function ThemeSync({ area }: { area: "public" | "admin" }) {
  useEffect(() => {
    applyTheme(area === "admin" ? "light" : readStoredTheme());
  }, [area]);
  return null;
}
