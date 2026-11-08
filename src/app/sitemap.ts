import { PUBLIC_ROUTES } from "@/constants/routes";
import { publicEnv } from "@/lib/env/client";

import type { MetadataRoute } from "next";

/**
 * sitemap.xml — 공개 7개 라우트만 (FRONT_ARCHITECTURE § 3 · IA 10-4). 관리자 · API · 쿼리 URL 은 넣지 않는다.
 * 콘텐츠 수정일을 알려면 Spring 을 불러야 해서 lastModified 는 두지 않는다 (빌드마다 바뀌는 값은 의미가 없다).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  return Object.values(PUBLIC_ROUTES).map((path) => ({
    url: path === PUBLIC_ROUTES.home ? base : `${base}${path}`,
    changeFrequency: path === PUBLIC_ROUTES.privacy ? "yearly" : "weekly",
    priority: path === PUBLIC_ROUTES.home ? 1 : 0.7,
  }));
}
