import { Geist, Geist_Mono, Google_Sans, Noto_Sans_KR, Roboto_Condensed } from "next/font/google";

import { SITE } from "@/data/site";
import { publicEnv } from "@/lib/env/client";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 한글 글꼴 (Noto Sans KR, 가변 굵기 100–900). 영문 · 숫자는 Geist 가 먼저 그리고 한글만 이 글꼴로 넘어온다.
 * 한글은 subset 목록에 없지만 Google 이 글자 묶음(unicode-range)으로 나눠 주어, 화면에 나온 글자 묶음만 내려받는다.
 * 미리 내려받을(preload) 라틴 글자는 Geist 가 맡으므로 끈다.
 */
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  preload: false,
  display: "swap",
});

/** 영문 포인트 글꼴 (Roboto Condensed, 가변 굵기 100–900) — GNB 메뉴 · 홈 섹션 타이틀 (font-nav) */
const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
});

/** 홈 히어로 제목 글꼴 (Google Sans — 구글 로고 글꼴 Product Sans 계열) — font-display */
const googleSans = Google_Sans({
  variable: "--font-google-sans",
  weight: "variable",
  subsets: ["latin"],
});

/**
 * 전역 메타데이터 (IA 10-4). 페이지는 title 문자열만 주면 "{title} · GDG on Campus PKNU" 가 된다.
 * 파비콘 · 아이콘은 app/ 의 파일 규약(favicon.ico · icon.png · apple-icon.png)으로 자동 연결된다.
 * OG 이미지는 전 페이지 공통 1장(public/images/og-gdgoc-pknu.png, 1200×630)을 쓴다 — 헤더 로고(심볼 + "GDGoC PKNU")를
 * 같은 비율로 키워 그린 것. 바꿀 때는 파일 이름도 바꾼다 (같은 이름이면 메신저가 예전 미리보기를 캐시해 둔다).
 */
const OG_IMAGE = { url: "/images/og-gdgoc-pknu.png", width: 1200, height: 630, alt: SITE.name };

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
  // Google Search Console 소유권 확인 (URL 접두어 https://gdgoc-pknu-web.vercel.app). 지우면 확인이 풀린다
  verification: { google: "ySNIxDTR-mzGBxuIhtYp8BjCDSguV0uPfgwLD8D_zW4" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme 은 아래 스크립트가 하이드레이션 전에 붙이므로 서버 HTML 과 달라도 경고하지 않는다
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} ${robotoCondensed.variable} ${googleSans.variable} h-full antialiased`}
    >
      <head>
        {/* 다크 테마를 첫 화면이 그려지기 전에 적용한다 (lib/theme.ts) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
