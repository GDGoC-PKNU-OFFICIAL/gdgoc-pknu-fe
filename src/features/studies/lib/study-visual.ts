/** 스터디 카드 그림 종류 — 주제(topic)를 보고 고른다 */
export type StudyVisualKind = "mobile" | "ai" | "web" | "server" | "default";

/** 주제는 관리자가 자유롭게 적으므로 들어 있는 낱말로 분야를 짐작한다. 맞는 게 없으면 default */
const KEYWORDS: [StudyVisualKind, RegExp][] = [
  ["mobile", /android|ios|flutter|swift|kotlin|mobile|모바일|안드로이드|앱/i],
  ["ai", /\bai\b|\bml\b|llm|data|머신|딥러닝|인공지능|데이터/i],
  ["web", /web|front|react|next|웹|프론트/i],
  ["server", /back|server|spring|cloud|devops|\bdb\b|백엔드|서버|클라우드/i],
];

export function studyVisualKind(topic: string): StudyVisualKind {
  return KEYWORDS.find(([, pattern]) => pattern.test(topic))?.[0] ?? "default";
}
