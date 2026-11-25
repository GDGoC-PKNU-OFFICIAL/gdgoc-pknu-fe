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

/** 프로젝트 배지 색 (정해진 팔레트). 실제 색은 projects/lib/project-labels.ts 가 라이트 · 다크로 매핑한다 */
export const BADGE_COLORS = ["blue", "green", "red", "yellow", "purple", "gray"] as const;
export type BadgeColor = (typeof BADGE_COLORS)[number];

/** 프로젝트마다 직접 정한 배지. 없으면 화면은 category 라벨 · 색을 쓴다 */
export interface ProjectBadge {
  label: string;
  color: BadgeColor;
}

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
  badge?: ProjectBadge; // 없으면 category 라벨 · 색
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
  /** 스터디 소개 문단. 나중에 생긴 필드라 없을 수 있다 → 빈 배열과 같다 (상세에서 소개 칸을 숨김) */
  description?: string[];
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

/**
 * 화면에서 쓰는 카테고리 5개 (관리자 선택지 · 캘린더 범례 순서).
 * 서버 코드값 7개는 그대로 두고, seminar 는 meeting(정기 세션), presentation 은 project(프로젝트)로 합쳐 보여 준다.
 */
export const EVENT_CATEGORY_CHOICES = [
  "meeting",
  "study",
  "project",
  "festival",
  "milestone",
] as const satisfies readonly EventCategory[];
export type EventCategoryChoice = (typeof EVENT_CATEGORY_CHOICES)[number];

/** 합쳐진 옛 코드값을 화면 카테고리로 바꾼다 (seminar → meeting, presentation → project) */
export function toEventCategoryChoice(category: EventCategory): EventCategoryChoice {
  if (category === "seminar") return "meeting";
  if (category === "presentation") return "project";
  return category;
}

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

interface MemberBase extends ResourceMeta {
  name: string;
  photoUrl?: string; // 없으면 기본 이미지
  department: string;
  history: string[]; // 최대 2개
  interests: string[]; // 최대 3개
  /** 분야 — 관리자가 직접 적은 글자 그대로 카드에 보인다 (예: "백엔드", "DevOps") */
  part: string;
  bio: string; // 최대 60자
  links: { github?: string; email?: string };
  /** 같은 구분 안에서의 표시 순서 (작을수록 앞). 관리자 목록의 ↑↓ 로 바꾼다 (PUT /members/order) */
  sortOrder: number;
}

export interface CoreMember extends MemberBase {
  status: "core";
}

export interface SeniorMember extends MemberBase {
  status: "senior";
}

/** 공개 응답용 멤버. 응답은 이미 구분 → 표시 순서로 정렬되어 온다 */
export type Member = CoreMember | SeniorMember;

/** 관리자 응답용 멤버. 공개 응답에는 consentConfirmedAt 이 없다 */
export type AdminMember = Member & { consentConfirmedAt: IsoDateTime };

// ============================================================
// 3-5 SiteSetting
// ============================================================

export interface SiteStat {
  label: string;
  value: number;
}

export interface SiteSetting {
  recruiting: boolean;
  recruitPeriod?: DatePeriod;
  stats: SiteStat[]; // 정확히 4개
  /** 홈 히어로 배경 사진 (R2 hero/). 없으면 사이트 기본 사진 (data/home.ts HERO.photo) */
  heroImageUrl?: string;
  /** 히어로 사진에서 보일 곳 "가로% 세로%". 없으면 기본 위치 */
  heroImagePosition?: string;
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
export const UPLOAD_TARGETS = ["project", "member", "about", "hero"] as const;
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
export const REVALIDATABLE_PATHS = [
  "/",
  "/about",
  "/projects",
  "/studies",
  "/events",
  "/members",
] as const;
export type RevalidatablePath = (typeof REVALIDATABLE_PATHS)[number];

export interface RevalidateResponse {
  revalidated: true;
  paths: RevalidatablePath[];
  now: number;
}

// ============================================================
// About (관리자가 수정하는 About 페이지 내용)
// ============================================================

/** 카드 모양 (ActivityPoster) */
export const ABOUT_ACTIVITY_LAYOUTS = [
  "color",
  "cover",
  "square",
  "top",
  "artwork",
  "logo",
  "circles",
] as const;
export type AboutActivityLayout = (typeof ABOUT_ACTIVITY_LAYOUTS)[number];

/** 카드 바탕색. auto 면 순서대로 돌아가는 기본 색 */
export const ABOUT_ACTIVITY_TONES = [
  "auto",
  "blue",
  "green",
  "coral",
  "orange",
  "navy",
  "gray",
  "purple",
  "forest",
  "plum",
] as const;
export type AboutActivityTone = (typeof ABOUT_ACTIVITY_TONES)[number];

export const RULE_ICONS = ["book", "person", "badge"] as const;
export type RuleIconCode = (typeof RULE_ICONS)[number];

/** What We Do 카드 한 장. 목록 순서가 곧 About · 홈 화면 순서다 */
export interface AboutActivityItem {
  title: string;
  description: string;
  layout: AboutActivityLayout;
  /** R2 업로드(about/) 또는 사이트 기본 그림(/images/…) */
  imageUrl?: string;
  /** circles 의 작은 원 */
  secondImageUrl?: string;
  /** 사진에서 카드에 보일 곳 (예: "35% 50%" = object-position). 없으면 모양마다 정한 기본 위치 */
  imagePosition?: string;
  /** 사진 확대 배율 % (100~300). 없으면 100 */
  imageZoom?: number;
  /** circles 의 작은 원 사진에서 보일 곳 · 확대 배율 */
  secondImagePosition?: string;
  secondImageZoom?: number;
  tone: AboutActivityTone;
}

export interface AboutRuleItem {
  slug: string;
  title: string;
  icon: RuleIconCode;
  /** 마크다운 본문 (features/about/lib/rule-markdown.ts 가 해석하는 문법만) */
  body: string;
}

export interface AboutFaqItem {
  question: string;
  answer: string;
}

export interface AboutContent {
  /** Who We Are 문단. 문단 안의 
 은 줄바꿈 */
  identity: string[];
  activities: AboutActivityItem[];
  rules: AboutRuleItem[];
  faq: AboutFaqItem[];
  /** 저장한 적이 없으면(코드 기본 내용) 없다 */
  updatedAt?: IsoDateTime;
}
