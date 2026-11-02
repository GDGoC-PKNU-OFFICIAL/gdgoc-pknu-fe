// src/data/events.ts
// P-04 Events 의 고정 문구 — 페이지 헤더 · 섹션 헤더(IA 10-2) · 빈 상태(IA 10-3).
//
// TODO(운영진): 페이지 헤더 설명은 초안이다. 확정 후 교체.

export const EVENTS_HEADER = {
  title: "Events",
  description: "정기 모임부터 세미나 · 행사까지, 동아리 일정을 한눈에 확인하세요.",
} as const;

export const CALENDAR_SECTION = { badge: "일정", title: "Calendar" } as const;

export const SCHEDULE_SECTION = {
  badge: "일정",
  title: "Schedule",
  upcomingTitle: "다가오는 일정",
  pastTitle: "지난 일정",
  empty: "등록된 일정이 없습니다.",
  upcomingEmpty: "예정된 일정이 없습니다. 새 학기 일정은 정해지는 대로 캘린더에 올라갑니다.",
} as const;
