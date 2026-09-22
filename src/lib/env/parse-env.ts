// src/lib/env/parse-env.ts
// server.ts · client.ts 공용 검증 헬퍼. 어떤 변수가 왜 틀렸는지 한 번에 보여 준다.
// 이 파일에는 "server-only" 를 넣지 않는다 (client.ts 도 쓰므로).

import type { z } from "zod";

export function parseEnv<S extends z.ZodType>(
  scope: "server" | "public",
  schema: S,
  raw: Record<string, unknown>,
): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(
      `[env:${scope}] 환경변수 검증 실패\n${lines.join("\n")}\n` +
        `.env.local.example 을 참고해 .env.local (또는 Vercel 환경변수)을 채워 주세요.`,
    );
  }
  return result.data;
}

/** "https://x.com/" → "https://x.com" — `${base}${path}` 결합 시 "//" 방지 */
export const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

/** "" → undefined — `.env` 에 `KEY=` 처럼 비워 둔 값을 "미설정"으로 취급 */
export const emptyToUndefined = (value: unknown): unknown => (value === "" ? undefined : value);
