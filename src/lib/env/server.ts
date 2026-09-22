// src/lib/env/server.ts
// 서버 전용 환경변수 (FRONT_ARCHITECTURE § 7).
//
// - `server-only` 때문에 클라이언트 컴포넌트가 이 파일을 import 하면 빌드가 실패한다.
//   브라우저에서는 NEXT_PUBLIC_ 이 아닌 변수가 전부 undefined 이므로, 섞이면 런타임에 터진다.
// - 빌드 시점 검증: 정적 프리렌더 중 평가되는 lib/api/public-api.ts 가 이 파일을 import 하므로
//   변수가 빠지면 `npm run build` 에서 실패한다 (런타임 500 이 아니라).
//   (instrumentation.ts 는 서버 "시작" 시점에 돌므로 빌드 검증 용도가 아니다)
//
// 설치: npm install zod server-only
// zod v4 에서는 z.string().url() 대신 z.url() 이 권장 형태다 (현재 코드는 v3 · v4 모두 동작).

import "server-only";
import { z } from "zod";
import { parseEnv, stripTrailingSlash } from "./parse-env";

const serverEnvSchema = z.object({
  /** Spring(Render) Base URL. 끝의 "/" 는 제거된다 */
  SPRING_API_BASE_URL: z.string().url().transform(stripTrailingSlash),
  /**
   * JWT 서명 키 — Render 와 "같은 값". HS256 은 256bit(32바이트) 이상 키가 필요하고,
   * Spring 쪽 jjwt 는 짧은 키를 WeakKeyException 으로 거부한다.
   * 생성 예: openssl rand -base64 48
   */
  JWT_SECRET: z.string().min(32, "HS256 키는 32자 이상이어야 합니다"),
  /** 수동 재검증(/api/revalidate) 헤더 x-revalidate-secret 값 */
  REVALIDATE_SECRET: z.string().min(16, "16자 이상이어야 합니다"),
});

export const serverEnv = parseEnv("server", serverEnvSchema, {
  SPRING_API_BASE_URL: process.env.SPRING_API_BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});

export type ServerEnv = typeof serverEnv;
