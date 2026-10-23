// /api/admin/[...path] — 관리자 API 프록시 (API 명세서 2-10 · 7장, FRONT_ARCHITECTURE § 5-2, PRD 4-3 ⑤)
// 관리자 브라우저는 Spring 을 직접 부르지 않는다. 쿠키의 JWT 를 Authorization: Bearer 로 바꿔 Spring /api/admin/{path} 로
// 전달하고, 응답은 상태 · 본문을 그대로 돌려준다. 권한 판단은 Spring 이 한다 — 여기서는 서명을 검증하지 않는다.
//
// - auth/** 는 전달하지 않는다. 로그인은 /api/admin/login 만 쓰고, 토큰이 브라우저로 내려가면 안 된다.
// - Spring 이 401 이면 쿠키를 지운다 (만료 · 위조 · 키 교체). 다음 /admin 이동에서 proxy.ts 가 로그인으로 보낸다.
// - 쓰기 요청이 2xx 면 같은 서버 안에서 revalidatePath 를 직접 호출한다 (HTTP 로 /api/revalidate 를 다시 부르지 않음).
//   재검증이 실패해도 저장은 이미 끝났으므로 응답은 성공 그대로 두고, 최대 30분(ISR) 안에 반영된다.
// - login · logout · session 은 같은 폴더의 정적 라우트가 먼저 잡으므로 여기로 오지 않는다.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

import { ADMIN_API_TIMEOUT_MS } from "@/constants/config";
import { ApiError } from "@/lib/api/api-error";
import { apiErrorJson, errorJson } from "@/lib/api/bff-response";
import { ADMIN_COOKIE_NAME, EXPIRED_ADMIN_COOKIE_OPTIONS } from "@/lib/auth/cookie";
import { serverEnv } from "@/lib/env/server";
import { pathsToRevalidate } from "@/lib/revalidate-map";

/** 브라우저로 넘길 Spring 응답 헤더. Location 은 201 등록 응답의 /api/admin/{resource}/{id} 로, BFF 에서도 같은 경로다 */
const FORWARDED_RESPONSE_HEADERS = ["content-type", "location"] as const;

function isBlockedPath(path: readonly string[]): boolean {
  // "." · ".." 세그먼트는 URL 정규화로 /api/admin 밖(공개 API 등)을 가리킬 수 있다
  return path[0]?.toLowerCase() === "auth" || path.some((s) => s === "." || s === "..");
}

async function forward(request: NextRequest, { params }: RouteContext<"/api/admin/[...path]">) {
  const { path } = await params;
  if (isBlockedPath(path)) return errorJson(404, "NOT_FOUND", "요청한 항목을 찾을 수 없습니다.");

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  // 쿠키가 없으면 결과가 401 로 정해져 있으므로 Spring 을 깨우지 않는다 (콜드 스타트 30초 회피)
  if (!token) return errorJson(401, "UNAUTHORIZED", "로그인이 필요합니다.");

  const { method } = request;
  const hasBody = method === "POST" || method === "PUT";
  const headers = new Headers({ Accept: "application/json", Authorization: `Bearer ${token}` });
  if (hasBody)
    headers.set("Content-Type", request.headers.get("content-type") ?? "application/json");

  const target = `${serverEnv.SPRING_API_BASE_URL}/api/admin/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  let res: Response;
  try {
    res = await fetch(target, {
      method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(ADMIN_API_TIMEOUT_MS),
    });
  } catch (cause) {
    return apiErrorJson(ApiError.fromFetchFailure(cause));
  }

  if (res.status === 401) cookieStore.set(ADMIN_COOKIE_NAME, "", EXPIRED_ADMIN_COOKIE_OPTIONS);

  if (res.ok) {
    for (const publicPath of pathsToRevalidate(method, path)) {
      try {
        revalidatePath(publicPath);
      } catch (error) {
        console.error(`[admin proxy] revalidatePath("${publicPath}") 실패`, error);
      }
    }
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = res.headers.get(name);
    if (value !== null) responseHeaders.set(name, value);
  }
  // 204 · 304 는 본문을 가질 수 없다 (Response 생성자가 거부한다)
  const body = res.status === 204 || res.status === 304 ? null : res.body;
  return new Response(body, { status: res.status, headers: responseHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
