// src/lib/analytics.ts
// GA4 이벤트 (IA 10-5 · FRONT_ARCHITECTURE § 3). 이벤트명 · 파라미터는 모두 snake_case.
// 스크립트는 공개 레이아웃의 <GoogleAnalytics> 가 NEXT_PUBLIC_GA_ID 가 있을 때만 싣는다.
// 측정 ID 가 없거나(로컬 · Preview) 스크립트가 아직 안 떴으면 아무것도 보내지 않는다 — 화면 동작에는 영향이 없다.

/** IA 10-5 표 그대로. 키 = 이벤트명, 값 = 파라미터 */
export interface AnalyticsEvents {
  sns_click: { channel: "github" | "discord" | "instagram" };
  project_detail_open: { slug: string; status: "current" | "past" };
  project_link_click: { slug: string; link_type: "github" | "demo" };
  year_select: { section: "past_projects"; year: number };
  member_card_flip: { section: "home" | "core_members" | "seniors"; member_id: number };
  // discord_cta_click · member_link_click 은 지금 화면에 해당 버튼 · 링크가 없어 두지 않았다
  // (About Discord CTA 는 팀 결정으로 제외 · 멤버 카드에는 외부 링크가 없다)
}

type Gtag = (command: "event", name: string, params: Record<string, string | number>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function trackEvent<E extends keyof AnalyticsEvents>(name: E, params: AnalyticsEvents[E]) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
