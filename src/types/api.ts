// src/types/api.ts
// API 명세서 3장 "응답 데이터 스키마"의 코드 표현.
// - 필드에 ? 가 붙은 것 = 명세서에서 "값이 없으면 응답에서 생략"한 선택 필드.
// - enum 은 `as const` 배열을 단일 출처로 두고 타입을 파생한다.
//   zod(z.enum), constants/labels.ts(satisfies Record<…>), 관리자 필터 Select 가 이 배열을 공유한다.

// ============================================================
// 공통 형식 (1-4)
// ============================================================

/** 월 단위 기간 값. 형식 "YYYY.MM" (예: "2026.03") */
export type YearMonth = string;
/** 날짜. 형식 "YYYY-MM-DD", KST 기준 */
export type IsoDate = string;
/** 일시. ISO 8601 + KST 오프셋 (예: "2026-09-15T19:30:00+09:00") */
export type IsoDateTime = string;

/** 프로젝트 · 스터디 기간. end 가 없으면 진행 중 */
export interface MonthPeriod {
  start: YearMonth;
  end?: YearMonth;
}

/** 날짜 기간 (모집 기간 등). start · end 모두 존재 */
export interface DatePeriod {
  start: IsoDate;
  end: IsoDate;
}

/** 모든 리소스 응답에 공통으로 포함되는 필드 */
interface ResourceMeta {
  id: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/** 프로젝트 · 스터디 현재/과거. 서버 계산값이며 요청에는 없다 (1-4) */
export const CONTENT_STATUSES = ["current", "past"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** 관리자 CRUD 리소스. 나열 순서 = 공개 GNB 순서 (1-5) */
export const ADMIN_RESOURCES = ["projects", "studies", "events", "members"] as const;
export type AdminResource = (typeof ADMIN_RESOURCES)[number];

// ============================================================
// 3-1 Project
// ============================================================

export const PROJECT_CATEGORIES = ["solution-challenge", "team-project", "official"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface ProjectTeamMember {
  name: string; // 멤버 테이블과 연결되지 않는 문자열
  role: string;
}

export interface Project extends ResourceMeta {
  slug: string;
  title: string;
  summary: string;
  description: string[]; // 문단 단위
  category: ProjectCategory;
  status: ContentStatus;
  period: MonthPeriod; // start 연도 = 과거 프로젝트 연도 버튼
  team: ProjectTeamMember[];
  techStack: string[];
  features: string[];
  outcomes: string[]; // 진행 중이면 목표
  thumbnailUrl?: string; // 없으면 기본 이미지
  links: { github?: string; demo?: string };
}

// ============================================================
// 3-2 Study
// ============================================================

export interface StudyOutput {
  label: string;
  url: string;
}

export interface Study extends ResourceMeta {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  status: ContentStatus;
  period: MonthPeriod;
  leader: string;
  participants: string[]; // 리더 제외. 카드 인원 수 = 1 + participants.length
  format?: string;
  outputs: StudyOutput[];
}

// ============================================================
// 3-3 EventItem
// ============================================================

export const EVENT_CATEGORIES = [
  "meeting",
  "seminar",
  "project",
  "study",
  "festival",
  "presentation",
  "milestone",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface EventItem extends ResourceMeta {
  title: string;
  category: EventCategory; // 캘린더 색상용 (필터 없음)
  date: IsoDate; // 시작일
  endDate?: IsoDate; // 여러 날 일정의 마지막 날
  time?: string; // 자유 입력, 예: "19:00–21:00"
  place?: string;
  summary?: string;
  sortOrder: number; // 같은 date 안의 순서, 0부터
}

// ============================================================
// 3-4 Member
// ============================================================

export const MEMBER_STATUSES = ["core", "senior"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** 배열 순서 = 코어멤버 카드 정렬 순서 (3-10) */
export const MEMBER_ROLES = ["lead", "part-lead", "core"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const MEMBER_PARTS = ["frontend", "backend", "mobile", "ai-ml", "design"] as const;
export type MemberPart = (typeof MEMBER_PARTS)[number];

interface MemberBase extends ResourceMeta {
  name: string;
  photoUrl?: string; // 없으면 기본 이미지
  department: string;
  history: string[]; // 최대 2개
  interests: string[]; // 최대 3개
  part: MemberPart;
  bio: string; // 최대 60자
  links: { github?: string; homepage?: string };
}

/** 코어멤버 — role 이 반드시 있다 */
export interface CoreMember extends MemberBase {
  status: "core";
  role: MemberRole;
}

/** 시니어 — role 이 없다 (응답에서 생략) */
export interface SeniorMember extends MemberBase {
  status: "senior";
  role?: never;
}

/**
 * 공개 응답용 멤버. `status` 로 좁히면 `role` 도 함께 좁혀진다.
 * @example if (m.status === "core") m.role // MemberRole (undefined 아님)
 */
export type Member = CoreMember | SeniorMember;

/** 관리자 응답용 멤버. 공개 응답에는 consentConfirmedAt 이 없다 */
export type AdminMember = Member & { consentConfirmedAt: IsoDateTime };

// ============================================================
// 3-5 SiteSetting
// ============================================================

export interface SiteStat {
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
}

export interface SiteSetting {
  recruiting: boolean;
  bannerText: string;
  recruitPeriod?: DatePeriod;
  stats: SiteStat[]; // 정확히 4개
  updatedAt: IsoDateTime;
}

// ============================================================
// 3-6 Dashboard
// ============================================================

export interface DashboardRecentUpdate {
  resource: AdminResource;
  id: number;
  title: string; // 멤버는 이름
  updatedAt: IsoDateTime;
}

export interface Dashboard {
  recruiting: boolean;
  counts: {
    projects: Record<ContentStatus, number>;
    studies: Record<ContentStatus, number>;
    events: { upcoming: number; past: number };
    members: Record<MemberStatus, number>;
  };
  upcomingEvents: EventItem[]; // 최대 3, 진행 중 포함
  recentUpdates: DashboardRecentUpdate[]; // 최대 5
}

// ============================================================
// 3-8 기타 응답
// ============================================================

/** Spring 로그인 응답. BFF 내부에서만 쓰고 브라우저에는 내려주지 않는다 */
export interface LoginResponse {
  token: string;
  expiresAt: IsoDateTime;
}

/** Next BFF 로그인 · 세션 조회 응답 */
export interface SessionResponse {
  expiresAt: IsoDateTime;
}

export interface SlugCheckResponse {
  available: boolean;
}

/** 업로드 대상 → 파일 키 접두사 projects/ · members/ */
export const UPLOAD_TARGETS = ["project", "member"] as const;
export type UploadTarget = (typeof UPLOAD_TARGETS)[number];

/** 허용 이미지 형식 (PresignRequest · ImageUploadField accept · config 공용) */
export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresAt: IsoDateTime;
}

export type HealthStatus = "UP" | "DOWN";

export interface HealthResponse {
  status: HealthStatus;
  db: HealthStatus;
}

/** 재검증 가능한 공개 경로 (4-9 허용 목록). /about · /privacy 는 정적이라 제외 */
export const REVALIDATABLE_PATHS = ["/", "/projects", "/studies", "/events", "/members"] as const;
export type RevalidatablePath = (typeof REVALIDATABLE_PATHS)[number];

export interface RevalidateResponse {
  revalidated: true;
  paths: RevalidatablePath[];
  now: number;
}
