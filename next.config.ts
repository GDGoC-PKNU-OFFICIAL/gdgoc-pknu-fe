import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lock 파일이 아니라 이 프로젝트를 워크스페이스 루트로 고정한다.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
