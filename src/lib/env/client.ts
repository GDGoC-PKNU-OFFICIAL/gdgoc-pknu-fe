// src/lib/env/client.ts
// 공개(NEXT_PUBLIC_) 환경변수 — 서버 · 클라이언트 양쪽에서 import 가능 (FRONT_ARCHITECTURE § 7).
//
// ⚠️ process.env.NEXT_PUBLIC_XXX 는 반드시 "리터럴 그대로" 참조한다.
//    Next 는 빌드 때 이 문자열을 값으로 치환하므로, process.env[key] 처럼 동적으로 읽으면
//    브라우저에서 undefined 가 된다.

import { z } from "zod";

import { emptyToUndefined, parseEnv, stripTrailingSlash } from "./parse-env";

const publicEnvSchema = z.object({
  /**
   * R2 공개 주소 (https://{bucket-id}.r2.dev). 끝의 "/" 는 제거된다.
   * 사용처: next.config images.remotePatterns, zod 의 thumbnailUrl · photoUrl 접두사 검사
   *        (`${base}/projects/` · `${base}/members/`)
   */
  NEXT_PUBLIC_R2_PUBLIC_BASE_URL: z.string().url().transform(stripTrailingSlash),
  /** GA4 측정 ID. 비워 두면 GA 비활성 — 로컬 · Preview 배포에서 통계 오염 방지 */
  NEXT_PUBLIC_GA_ID: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^G-[A-Z0-9]+$/, "GA4 측정 ID 형식(G-XXXX)이 아닙니다")
      .optional(),
  ),
  /** 사이트 절대 주소 — OG · sitemap. 끝의 "/" 는 제거된다 */
  NEXT_PUBLIC_SITE_URL: z.string().url().transform(stripTrailingSlash),
});

export const publicEnv = parseEnv("public", publicEnvSchema, {
  NEXT_PUBLIC_R2_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export type PublicEnv = typeof publicEnv;
