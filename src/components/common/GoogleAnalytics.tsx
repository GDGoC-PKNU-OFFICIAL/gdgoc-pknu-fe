import Script from "next/script";

import { publicEnv } from "@/lib/env/client";

/**
 * GA4 (gtag.js). 측정 ID(NEXT_PUBLIC_GA_ID)가 있을 때만 싣는다 — 로컬 · Preview 배포는 통계를 오염시키지 않는다.
 * 공개 레이아웃에서만 쓴다: 관리자 화면은 측정하지 않는다.
 * 페이지 이동(클라이언트 라우팅)은 GA4 향상된 측정의 "브라우저 기록 이벤트 기반 페이지 변경"이 page_view 로 잡는다.
 * 이벤트는 lib/analytics.ts 의 trackEvent 로 보낸다.
 */
export default function GoogleAnalytics() {
  const gaId = publicEnv.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
