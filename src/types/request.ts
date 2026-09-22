// src/types/request.ts
// API 명세서 4장 "요청 Body 스키마" + 2장의 관리자 목록 쿼리.
//
// Body 규칙 (1-4)
// - 모든 필드를 항상 보낸다. 비울 때는 null(단일 값) · [](배열). `?` 선택 필드를 두지 않는다.
// - 서버 계산값(status) · 서버 관리 값(id, sortOrder, consentConfirmedAt, createdAt, updatedAt)은 넣지 않는다.

import type {
  ContentStatus,
  EventCategory,
  ImageContentType,
  IsoDate,
  MemberPart,
  MemberRole,
  MemberStatus,
  ProjectCategory,
  RevalidatablePath,
  UploadTarget,
  YearMonth,
} from "./api";
import type { ListQueryBase } from "./common";

// ============================================================
// 공통 형식
// ============================================================

/** 요청용 월 기간. end 를 비우면 null (진행 중) */
export interface MonthPeriodRequest {
  start: YearMonth;
  end: YearMonth | null;
}

// ============================================================
// 4-1 LoginRequest
// ============================================================

export interface LoginRequest {
  loginId: string; // 40자 이하
  password: string;
}

// ============================================================
// 4-2 ProjectRequest
// ============================================================

export interface ProjectRequest {
  title: string; // 40자 이하
  slug: string; // ^[a-z0-9]+(-[a-z0-9]+)*$, 60자 이하
  summary: string; // 80자 이하
  category: ProjectCategory;
  period: MonthPeriodRequest; // start ≤ end
  thumbnailUrl: string | null; // R2_PUBLIC_BASE_URL/projects/ 로 시작
  description: string[]; // 1~10문단, 문단당 1,000자 이하
  team: { name: string; role: string }[]; // 최대 20개, 각 20자 이하
  techStack: string[]; // 최대 10개, 각 20자 이하, 중복 불가
  features: string[]; // 최대 10개, 각 80자 이하
  outcomes: string[]; // 최대 10개, 각 80자 이하
  links: { github: string | null; demo: string | null }; // http(s) URL, 500자 이하
}

// ============================================================
// 4-3 StudyRequest
// ============================================================

export interface StudyRequest {
  title: string; // 40자 이하
  slug: string; // 60자 이하
  summary: string; // 80자 이하
  topic: string; // 20자 이하
  period: MonthPeriodRequest;
  leader: string; // 20자 이하
  participants: string[]; // 최대 30개, 각 20자 이하 (리더 제외)
  format: string | null; // 30자 이하
  outputs: { label: string; url: string }[]; // 최대 5개, label 30자 이하, url 필수
}

// ============================================================
// 4-4 EventRequest
// ============================================================

export interface EventRequest {
  title: string; // 40자 이하
  category: EventCategory;
  date: IsoDate;
  endDate: IsoDate | null; // date ≤ endDate
  time: string | null; // 20자 이하
  place: string | null; // 40자 이하
  summary: string | null; // 80자 이하
  // sortOrder 없음 — 등록 · 날짜 변경 시 서버가 지정, 순서 변경은 EventOrderRequest 로만
}

// ============================================================
// 4-5 EventOrderRequest
// ============================================================

export interface EventOrderRequest {
  date: IsoDate;
  orderedIds: number[]; // 해당 date 의 일정 id 전체와 정확히 일치
}

// ============================================================
// 4-6 MemberRequest
// ============================================================

interface MemberRequestBase {
  photoUrl: string | null; // R2_PUBLIC_BASE_URL/members/ 로 시작
  name: string; // 20자 이하
  department: string; // 30자 이하
  history: string[]; // 최대 2개, 각 40자 이하
  interests: string[]; // 최대 3개, 각 15자 이하, 중복 불가
  part: MemberPart;
  bio: string; // 60자 이하
  links: { github: string | null; homepage: string | null };
  consentConfirmed: boolean; // false 면 서버가 fieldErrors 로 거부 (zod 에서는 true 강제)
}

/**
 * 코어멤버면 role 필수, 시니어면 role 은 반드시 null.
 * 폼 상태는 평평하게 두고, toRequest() 의 반환 타입으로 이 규칙을 강제한다.
 */
export type MemberRequest =
  | (MemberRequestBase & { status: "core"; role: MemberRole })
  | (MemberRequestBase & { status: "senior"; role: null });

// ============================================================
// 4-7 SettingRequest
// ============================================================

/**
 * 응답의 SiteStat 은 unit? · suffix? 이지만, 요청은 1-4 규칙에 따라 null 로 보낸다.
 * ⚠️ 명세서 4-7 표가 `unit?` · `suffix?` 로 적혀 있어 1-4 와 충돌 — 백엔드와 null 전송으로 확정 후 명세 수정 필요.
 */
export interface SiteStatRequest {
  label: string; // 20자 이하
  value: number; // 0 이상 정수
  unit: string | null; // 10자 이하
  suffix: string | null; // 5자 이하
}

export interface SettingRequest {
  recruiting: boolean;
  bannerText: string; // 60자 이하
  recruitPeriod: { start: IsoDate; end: IsoDate } | null; // 둘 다 입력하거나 null, start ≤ end
  stats: SiteStatRequest[]; // 정확히 4개
}

// ============================================================
// 4-8 PresignRequest
// ============================================================

export interface PresignRequest {
  target: UploadTarget;
  contentType: ImageContentType;
  size: number; // bytes, 5,242,880 이하 (신고값 — 실제 용량은 저장 시 재검증)
}

// ============================================================
// 4-9 RevalidateRequest
// ============================================================

export interface RevalidateRequest {
  paths: RevalidatablePath[];
}

// ============================================================
// 2장 관리자 목록 · 보조 쿼리 (URL Query — 생략 시 서버 기본값)
// ============================================================

/** GET /api/admin/projects — 기본 정렬 periodStart,desc */
export interface ProjectListQuery extends ListQueryBase<"periodStart" | "title" | "updatedAt"> {
  status?: ContentStatus;
  category?: ProjectCategory;
  year?: number; // period.start 연도
}

/** GET /api/admin/studies — q 검색 대상: 제목 · 리더. 기본 정렬 periodStart,desc */
export interface StudyListQuery extends ListQueryBase<"periodStart" | "title" | "updatedAt"> {
  status?: ContentStatus;
  year?: number; // period.start 연도
}

/** GET /api/admin/events — 기본 정렬 date,desc → 같은 날짜는 sortOrder 오름차순 */
export interface EventListQuery extends ListQueryBase<"date" | "title" | "updatedAt"> {
  category?: EventCategory;
  year?: number; // date 연도
}

/** GET /api/admin/members — year 필터 없음. 기본 정렬: 구분 → 역할 순 → 이름 */
export interface MemberListQuery extends ListQueryBase<"name" | "updatedAt"> {
  status?: MemberStatus;
  role?: MemberRole;
}

/** GET /api/admin/{projects|studies}/slug-check */
export interface SlugCheckQuery {
  slug: string;
  excludeId?: number; // 수정 화면에서 자기 자신 제외
}
