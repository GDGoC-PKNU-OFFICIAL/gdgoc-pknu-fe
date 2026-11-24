// src/data/about.ts
// P-01 About 의 페이지 헤더 · 정체성 · 활동 방식 (IA 4장 P-01 #1~3).
// 홈 About 요약(P-00 #3)도 ACTIVITIES 의 앞 3개를 쓴다.
//
// TODO(운영진): 문구는 PRD 3-4 를 바탕으로 한 초안이다. 주기 · 설명을 실제 운영 방식으로 확정할 것.

export const ABOUT_HEADER = {
  title: "About",
  description: "GDG on Campus PKNU가 어떤 커뮤니티이고, 어떻게 활동하는지 소개합니다.",
} as const;

/** paragraphs 안의 \n 은 화면에서 줄바꿈이 된다 (문장마다 줄을 바꾼다) */
export const IDENTITY = {
  title: "Who We Are",
  paragraphs: [
    "Google Developer Groups On Campus(이하 GDG)는 대학 기반의 커뮤니티입니다.\nGDG on Campus PKNU는 이 프로그램에 속한 국립부경대학교 학생 개발자 커뮤니티입니다.",
    "개발자로 성장하는 데 관심이 있는 모든 학부생을(재학, 휴학 모두 가능) 환영합니다.\nGDG에 가입하면 동료들과의 학습을 통해 지식을 쌓고 지역 커뮤니티를 위한 솔루션을 구축할 수 있습니다.",
    "동아리의 최종 목표는 학생들이 이론과 실무의 격차를 해소할 수 있도록 지원하는 것입니다.",
  ],
} as const;

export interface Activity {
  title: string;
  /** 주기 · 시기 */
  cadence: string;
  description: string;
  /** 홈 What We Do 카드 그림 (public/ 기준 경로, 800×520). 없으면 그림 없이 그린다 */
  image?: string;
  /** About What We Do 포스터 카드의 배경 사진 (public/ 기준, 세로 3:4 로 가운데를 잘라 쓴다). 없으면 색 카드 */
  photo?: string;
  /**
   * photo 를 까는 방식. cover = 카드 전체를 사진으로 채움(기본),
   * square = 위쪽은 카드 폭 정사각형 사진, 그 아래는 같은 사진을 흐리게,
   * top = 사진은 글자 위쪽 자리만 채우고 글자는 색 바탕 위에 (사진이 글자를 침범하지 않는다)
   */
  photoLayout?: "cover" | "square" | "top";
  /** cover 사진에서 보일 중심 (CSS object-position, 예: "35% 50%"). 없으면 가운데 */
  photoPosition?: string;
  /**
   * About 포스터 카드 위쪽에 얹을 정사각형 그림 (public/ 기준, 정사각형으로 잘라 둔 파일). 화면 캡처 · 로고 등.
   * 색 카드 위에 둥근 모서리로 얹는다 (photo 가 있으면 photo 가 우선)
   */
  artwork?: string;
  /**
   * About 포스터 카드 바탕 (Tailwind 그라데이션 클래스를 통째로). 없으면 순서대로 돌아가는 기본 색.
   * 채도를 낮춘 탁한 색으로 위는 어둡고 아래로 갈수록 밝아지게 쓴다
   */
  background?: string;
  /** true 면 About 포스터 카드 가운데에 GNB 와 같은 로고(심볼 + "GDGoC PKNU" 글자)를 크게 얹는다 */
  logo?: boolean;
  /**
   * About 포스터 카드에 액자처럼 얹을 원형 사진 두 장 [큰 원, 작은 원] (public/ 기준, 정사각형으로 잘라 둔 파일).
   * 색 그라데이션 카드 위에 큰 원과, 그 오른쪽 아래에 겹치지 않는 작은 원으로 놓는다
   */
  circles?: readonly [string, string];
}

export const ACTIVITIES = {
  title: "What We Do",
  items: [
    {
      title: "정기 세션",
      cadence: "격주",
      description:
        "현직자의 조언을 듣는 커리어 세션과, 그동안 공부한 기술을 나누는 기술 세미나 · 테크톡을 엽니다.",
      image: "/images/activities/session-color.webp",
      photo: "/images/activities/session-photo.webp",
      photoLayout: "square",
    },
    {
      title: "파트 스터디",
      cadence: "학기 중 주 1회",
      description:
        "원하는 스터디를 직접 만들거나 참여하며 기본기를 다집니다. 미니 프로젝트 · 스터디로 부담 없이 경험을 쌓을 수 있어요.",
      image: "/images/activities/study-color.webp",
      circles: ["/images/activities/study-circle-1.webp", "/images/activities/study-circle-2.webp"],
      background: "bg-gradient-to-b from-[#24392d] via-[#33503f] to-[#4d7560]",
    },
    {
      title: "학기 프로젝트",
      cadence: "학기 단위",
      description:
        "학기 초 네트워킹 행사로 팀을 꾸리고, 진행 과정 관리와 현업자 멘토링을 받으며 서비스를 완성합니다.",
      image: "/images/activities/project-color.webp",
      photo: "/images/activities/project-photo.webp",
    },
    {
      title: "개발 입문 교육",
      cadence: "학기 초",
      description:
        "개발 경험이 없어도 괜찮아요! 프론트엔드 · 백엔드 · AI · 게임 등 여러 분야를 직접 체험해 본 뒤 진로를 고를 수 있는 입문 교육입니다.",
      image: "/images/activities/intro-illust.webp",
    },
    // Solution Challenge 는 아래 대외활동에 포함되어 하나로 합쳤다
    {
      title: "GDG 관련 대외활동",
      cadence: "연중",
      description:
        "전 세계 규모 개발 대회 Solution Challenge 에 도전하고(부경대에서 한국 최초 최종 우승 팀 배출), 전국 35개 대학 GDG on Campus 와도 교류할 수 있습니다.",
      image: "/images/activities/gdg-events-illust.webp",
      photo: "/images/activities/gdg-events-photo-2.webp",
    },
    {
      title: "Build with AI",
      cadence: "행사",
      description:
        "GDG 의 지원을 받아 부경대에서 여는 AI 개발 행사입니다. 구글 Antigravity 로 AI 에이전트 기반 개발을 경험하고 최신 구글 기술을 실습합니다.",
      image: "/images/activities/build-ai-illust.webp",
    },
    // 무료 학습 콘텐츠 (Guarantee) — About 에서만 보인다 (ABOUT_ACTIVITY_GROUPS)
    {
      title: "Google Cloud Study Jam",
      cadence: "매 분기",
      artwork: "/images/activities/study-jam-finder.webp",
      description:
        "매 분기 열리는 구글 클라우드 스터디 잼에서 그룹으로 새로운 구글 기술을 함께 학습합니다.",
    },
    {
      title: "Google Cloud Skills Boost",
      cadence: "상시",
      photo: "/images/activities/skills-boost-photo.webp",
      photoLayout: "top",
      photoPosition: "33% 50%",
      description:
        "플랫폼에서 배우고 싶은 콘텐츠가 있다면 팀원을 모아 리드에게 알려 주세요. 그 콘텐츠로 스터디를 열 수 있게 도와드립니다.",
    },
    {
      title: "Google Career Certificate",
      cadence: "신규 멤버 모집 후",
      logo: true,
      background: "bg-gradient-to-b from-[#2d2738] via-[#41385a] to-[#63587e]",
      description: "신규 멤버 모집 후 그룹을 꾸려 구글 커리어 자격증 학습 참여를 도와드립니다.",
    },
  ] satisfies Activity[],
} as const;

/**
 * About What We Do 카드 묶음 (ACTIVITIES 의 title, 이 순서대로). eyebrow 는 카드 제목 위 작은 글씨.
 * 관리자가 About 을 저장하기 전의 기본 내용(features/about/lib/about-content.ts DEFAULT_ABOUT)을 만들 때만 쓴다.
 */
export const ABOUT_ACTIVITY_GROUPS = [
  {
    eyebrow: "GDGoC PKNU 활동",
    titles: ["정기 세션", "파트 스터디", "학기 프로젝트", "GDG 관련 대외활동"],
  },
  {
    eyebrow: "무료 학습 콘텐츠",
    titles: ["Google Cloud Study Jam", "Google Cloud Skills Boost", "Google Career Certificate"],
  },
] as const;
