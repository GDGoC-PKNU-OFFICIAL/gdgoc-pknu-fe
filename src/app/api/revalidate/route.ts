// POST /api/revalidate — 수동 재검증 (API 명세서 2-10 · 4-9, PRD 4-5)
// 운영자가 직접 부르는 비상용 입구다. 관리자 저장 · 삭제는 BFF 프록시가 같은 서버 안에서 revalidatePath 를 부르므로
// 평소에는 쓰지 않는다. 헤더 x-revalidate-secret 이 REVALIDATE_SECRET 과 같아야 하고, 경로는 허용 목록만 받는다.
//
// @example
//   curl -X POST https://{site}/api/revalidate \
//     -H "x-revalidate-secret: $REVALIDATE_SECRET" -H "Content-Type: application/json" \
//     -d '{"paths":["/","/projects"]}'

import { timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { errorJson } from "@/lib/api/bff-response";
import { serverEnv } from "@/lib/env/server";
import { REVALIDATABLE_PATHS, type RevalidatablePath, type RevalidateResponse } from "@/types/api";

const SECRET_HEADER = "x-revalidate-secret";

/** 길이가 달라도 비교 시간이 값에 따라 달라지지 않게 같은 길이로 맞춰 비교한다 */
function secretMatches(given: string | null): boolean {
  if (given === null) return false;
  const expected = Buffer.from(serverEnv.REVALIDATE_SECRET);
  const actual = Buffer.from(given);
  if (actual.length !== expected.length) {
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(actual, expected);
}

function isRevalidatablePath(value: unknown): value is RevalidatablePath {
  return (REVALIDATABLE_PATHS as readonly unknown[]).includes(value);
}

/** 본문 { paths: string[] } 검사 (명세 4-9). 허용 목록 밖 · 빈 배열 · 형식 오류는 400 */
function parsePaths(body: unknown): RevalidatablePath[] | null {
  if (typeof body !== "object" || body === null) return null;
  const { paths } = body as { paths?: unknown };
  if (!Array.isArray(paths) || paths.length === 0 || !paths.every(isRevalidatablePath)) {
    return null;
  }
  return [...new Set(paths)];
}

export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get(SECRET_HEADER))) {
    return errorJson(401, "UNAUTHORIZED", "재검증 토큰이 올바르지 않습니다.");
  }

  const body: unknown = await request.json().catch(() => null);
  const paths = parsePaths(body);
  if (paths === null) {
    return errorJson(400, "VALIDATION_FAILED", "입력값을 확인해 주세요.", [
      {
        field: "paths",
        message: `허용된 경로만 보낼 수 있습니다: ${REVALIDATABLE_PATHS.join(", ")}`,
      },
    ]);
  }

  for (const path of paths) revalidatePath(path);
  return NextResponse.json<RevalidateResponse>({ revalidated: true, paths, now: Date.now() });
}
