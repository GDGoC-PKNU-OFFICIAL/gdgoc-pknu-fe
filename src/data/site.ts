// src/data/site.ts
// 사이트 전역 문구 — 메타데이터 · Footer 브랜드 영역 · OG 가 공유한다 (PRD 5-2: 코드로 관리).

export const SITE = {
  name: "GDG on Campus PKNU",
  /** 소속 표기 (Footer 하단 바) */
  affiliation: "GDG on Campus · 국립부경대학교",
  /** 동아리 한 줄 소개 (Footer 브랜드 · 기본 description) */
  tagline: "국립부경대학교 학생 개발자 커뮤니티",
  description:
    "GDG on Campus PKNU는 국립부경대학교 학생 개발자 커뮤니티입니다. 정기 세션 · 파트 스터디 · 학기 프로젝트로 함께 배우고 끝까지 만듭니다.",
  contactEmail: "gdscpknu@gmail.com",
  /** 저작권 표기 시작 연도 */
  copyrightYear: 2026,
} as const;
