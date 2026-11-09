import { publicEnv } from "@/lib/env/client";

import type { MetadataRoute } from "next";

/**
 * robots.txt — 관리자(/admin)와 API(/api)는 크롤링하지 않는다 (PRD 4-1 · IA 10-4).
 * 관리자 페이지는 이와 별개로 각 페이지에 noindex 를 둔다 ((admin)/layout.tsx).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${publicEnv.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
