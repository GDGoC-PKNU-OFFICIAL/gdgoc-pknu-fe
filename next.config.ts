import path from "node:path";

import type { NextConfig } from "next";

// next.config 는 src/ 밖에서 Next 가 직접 읽으므로 @/* 별칭을 쓰지 않는다.
// lib/env/client.ts 와 같은 변수이지만, 여기서는 이미지 허용 호스트 등록에만 쓴다 (값 검증은 client.ts 가 빌드 때 한다).
const r2PublicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lock 파일이 아니라 이 프로젝트를 워크스페이스 루트로 고정한다.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    // 이미지 최적화 품질. 허용 목록이 90 하나라 <Image> 의 기본 품질(75)도 가장 가까운 90 으로 맞춰진다
    // → 사이트의 모든 사진을 더 선명하게 (파일은 조금 커진다)
    qualities: [90],
    // R2 공개 주소의 업로드 경로(projects/ · members/)만 <Image> 최적화를 허용한다 (API 명세서 1-1).
    remotePatterns: r2PublicBaseUrl
      ? [new URL(`${r2PublicBaseUrl}/projects/**`), new URL(`${r2PublicBaseUrl}/members/**`)]
      : [],
  },
};

export default nextConfig;
