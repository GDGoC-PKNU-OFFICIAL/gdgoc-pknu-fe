// src/lib/cn.ts
// Tailwind 클래스 조건부 결합 + 충돌 클래스 정리.
// 설치: npm install clsx tailwind-merge
// ⚠️ Tailwind v4 는 tailwind-merge v3 이상에서 지원된다 (package.json 확인).
//    globals.css 의 @theme 에 커스텀 토큰(폰트 크기 등)을 추가해 병합이 틀리면
//    extendTailwindMerge 로 해당 토큰을 등록한다.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @example cn("px-2 py-1", isActive && "bg-blue-500", "px-4")
 *          → "py-1 bg-blue-500 px-4"  (뒤에 온 px-4 가 앞의 px-2 를 덮어씀)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
