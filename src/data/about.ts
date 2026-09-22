// src/data/about.ts
// P-01 About 의 페이지 헤더 · 정체성 · 활동 방식 (IA 4장 P-01 #1~3).
// 홈 About 요약(P-00 #3)도 ACTIVITIES 의 앞 3개를 쓴다.
//
// TODO(운영진): 문구는 PRD 3-4 를 바탕으로 한 초안이다. 주기 · 설명을 실제 운영 방식으로 확정할 것.

export const ABOUT_HEADER = {
  title: "About",
  description: "GDG on Campus PKNU가 어떤 커뮤니티이고, 어떻게 활동하는지 소개합니다.",
} as const;

export const IDENTITY = {
  badge: "동아리 소개",
  title: "Who We Are",
  paragraphs: [
    "GDG on Campus PKNU는 Google Developer Groups on Campus 프로그램에 속한 국립부경대학교 학생 개발자 커뮤니티입니다.",
    "전공과 학년에 상관없이 개발을 배우고 싶은 학생이 모여, 함께 공부하고 실제로 동작하는 서비스를 끝까지 만들어 봅니다.",
  ],
} as const;

export interface Activity {
  title: string;
  /** 주기 · 시기 */
  cadence: string;
  description: string;
}

export const ACTIVITIES = {
  badge: "활동 방식",
  title: "What We Do",
  items: [
    {
      title: "정기 세션",
      cadence: "격주",
      description: "멤버와 초청 연사가 기술 · 경험을 나누는 발표 세션입니다.",
    },
    {
      title: "파트 스터디",
      cadence: "학기 중 주 1회",
      description: "프론트엔드 · 백엔드 · 모바일 · AI·ML 등 파트별로 모여 함께 공부합니다.",
    },
    {
      title: "학기 프로젝트",
      cadence: "학기 단위",
      description: "팀을 꾸려 한 학기 동안 서비스를 기획하고 배포까지 완성합니다.",
    },
    {
      title: "Solution Challenge",
      cadence: "연 1회",
      description: "Google 기술로 사회 문제를 해결하는 글로벌 대회에 팀으로 참가합니다.",
    },
  ] satisfies Activity[],
} as const;
