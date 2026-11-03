import { PUBLIC_ROUTES } from "@/constants/routes";

/** Studies 페이지에서 카드 하나를 가리키는 앵커 id */
export function studyAnchorId(slug: string) {
  return `study-${slug}`;
}

/** 홈 카드에서 Studies 페이지의 해당 카드로 바로 간다 */
export function studyHref(slug: string) {
  return `${PUBLIC_ROUTES.studies}#${studyAnchorId(slug)}`;
}
