// src/lib/api/public-api.ts
// 공개 콘텐츠 API (API 명세서 2-1). 서버 컴포넌트가 빌드 · ISR 시점에만 호출한다 (FRONT_ARCHITECTURE § 5-1).
//
// - "server-only": 클라이언트 컴포넌트가 import 하면 빌드가 실패한다.
//   방문자 브라우저가 Spring(Render)을 직접 부르면 콜드 스타트 30초가 방문자에게 닿는다 (제약 1).
// - serverEnv import: 이 파일이 쓰이는 순간부터 서버 환경변수가 빌드에서 검증된다 (§ 7).
// - 실패하면 throw 한다. 빈 배열로 대체하지 않는다 — ISR 재생성 실패 시 Next 가 기존 페이지를 유지한다.
//   최초 빌드에서 실패하면 빌드가 멈추고, 재배포로 대응한다 (PRD 1장 6번: 빌드 시점 폴백 없음).
// - cache(): 타임아웃용 signal 을 넘기면 Next 의 fetch 중복 제거(memoization)가 꺼진다.
//   홈처럼 한 렌더에서 같은 목록을 여러 번 부르는 경우를 위해 React cache 로 다시 묶는다.
//   (30분 데이터 캐시는 fetch 의 next.revalidate 가 담당하며 signal 과 무관하다)

import "server-only";
import { cache } from "react";

import { PUBLIC_API_TIMEOUT_MS, REVALIDATE_SECONDS } from "@/constants/config";
import { serverEnv } from "@/lib/env/server";
import type { EventItem, Member, Project, SiteSetting, Study } from "@/types/api";

import { requestJson } from "./http";

function getPublic<T>(path: `/api/${string}`): Promise<T> {
  return requestJson<T>(`${serverEnv.SPRING_API_BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    timeoutMs: PUBLIC_API_TIMEOUT_MS,
  });
}

/** 현재 · 과거 프로젝트 전체. period.start 최신순. 상세 카드 내용까지 포함한다 */
export const getProjects = cache(() => getPublic<Project[]>("/api/projects"));

/** 현재 · 과거 스터디 전체. period.start 최신순 */
export const getStudies = cache(() => getPublic<Study[]>("/api/studies"));

/** 지난 일정 포함 전체. date 오름차순 → sortOrder 오름차순 */
export const getEvents = cache(() => getPublic<EventItem[]>("/api/events"));

/** 코어멤버 · 시니어 전체. 구분별 묶기 · 정렬은 프론트에서 한다 */
export const getMembers = cache(() => getPublic<Member[]>("/api/members"));

/** 모집 상태 배너 + 활동 통계 4개 */
export const getSettings = cache(() => getPublic<SiteSetting>("/api/settings"));
