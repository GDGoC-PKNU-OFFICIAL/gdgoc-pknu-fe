// src/components/admin/lib/suggest-slug.ts
// 제목 → 슬러그 자동 제안 (IA 8-4 A-12 · A-22 "제목에서 자동 제안").
// 규칙은 명세 4-2 의 SLUG_PATTERN(^[a-z0-9]+(-[a-z0-9]+)*$)을 만족하는 값만 만든다.
// 한글은 로마자로 바꾸지 않는다 — 결과가 어색해 어차피 손으로 고치게 되므로, 영문 · 숫자만 남긴다.

/**
 * @example suggestSlug("Campus Map 2.0") // "campus-map-2-0"
 * @example suggestSlug("캠퍼스 맵")       // ""  (제안할 것이 없음)
 */
export function suggestSlug(title: string, maxLength: number): string {
  return title
    .normalize("NFKD") // 악센트 문자(é → e + ́) 분리
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, ""); // 자른 끝이 하이픈이면 패턴 위반
}
