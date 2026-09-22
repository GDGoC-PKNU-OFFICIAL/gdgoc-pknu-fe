import { Geist, Geist_Mono } from "next/font/google";

import { SITE } from "@/data/site";
import { publicEnv } from "@/lib/env/client";

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
 * 전역 메타데이터 (IA 10-4). 페이지는 title 문자열만 주면 "{title} · GDG on Campus PKNU" 가 된다.
 * 파비콘 · 아이콘은 app/ 의 파일 규약(favicon.ico · icon.png · apple-icon.png)으로 자동 연결된다.
 * OG 이미지는 전 페이지 공통 1장(public/images/og-default.png, 1200×630)을 쓴다.
 */
const OG_IMAGE = { url: "/images/og-default.png", width: 1200, height: 630, alt: SITE.name };

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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
