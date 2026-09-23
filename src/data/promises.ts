// src/data/promises.ts
// 약속 섹션 C-07 (PRD 3-2 · IA 5-6). 개인정보처리방침 · 404 에는 약속 섹션이 없다.
//
// TODO(운영진): 문안은 PRD 3-2 의 "약속 주제 (예시)"를 바탕으로 한 초안이다. 확정 후 교체.
//   - 강령(codeOfConduct) 5개가 모든 약속의 기준이고, 홈 3개는 그 요약이다.

import { CODE_OF_CONDUCT_ID, PUBLIC_ROUTES } from "@/constants/routes";

export interface PromiseItem {
  title: string;
  description: string;
}

export interface PromiseSet {
  /** IA 10-2 섹션 헤더: [한국어 배지] → 영문 타이틀 */
  badge: string;
  title: string;
  items: readonly PromiseItem[];
  /** 섹션 하단 링크 (홈만 사용) */
  link?: { label: string; href: string };
  /** 섹션 앵커 id (About 강령만 사용) */
  anchorId?: string;
}

const OUR_PROMISE = { badge: "우리의 약속", title: "Our Promise" } as const;

const codeOfConduct: readonly PromiseItem[] = [
  {
    title: "함께 성장한다",
    description: "실력보다 태도를 봅니다. 모르는 것을 묻고, 아는 것을 알려 줍니다.",
  },
  {
    title: "끝까지 만든다",
    description: "시작한 프로젝트와 스터디는 결과물이 나올 때까지 함께 갑니다.",
  },
  {
    title: "배운 것을 나눈다",
    description: "세션 · 발표 · 기록으로 배운 것을 다음 사람에게 남깁니다.",
  },
  { title: "서로를 존중한다", description: "전공 · 학년 · 속도가 달라도 모두 같은 멤버입니다." },
  { title: "약속을 지킨다", description: "시간과 역할을 지키고, 못 지킬 때는 미리 알립니다." },
];

export const PROMISES = {
  home: {
    ...OUR_PROMISE,
    items: codeOfConduct.slice(0, 3),
    link: {
      label: "동아리 강령 전체 보기",
      href: `${PUBLIC_ROUTES.about}#${CODE_OF_CONDUCT_ID}`,
    },
  },
  about: {
    badge: "동아리 강령",
    title: "Code of Conduct",
    items: codeOfConduct,
    anchorId: CODE_OF_CONDUCT_ID,
  },
  projects: {
    ...OUR_PROMISE,
    items: [
      {
        title: "배포까지 간다",
        description: "로컬에서 멈추지 않고 누구나 써 볼 수 있게 배포합니다.",
      },
      {
        title: "코드를 공개한다",
        description: "결과물은 GitHub 에 공개해 다음 기수의 출발점이 됩니다.",
      },
      {
        title: "역할과 기록을 명확히 한다",
        description: "누가 무엇을 했는지 남겨 모두의 포트폴리오가 되게 합니다.",
      },
      { title: "데모데이까지 함께한다", description: "마지막 발표까지 팀 전원이 같이 갑니다." },
    ],
  },
  studies: {
    ...OUR_PROMISE,
    items: [
      {
        title: "준비해 온 만큼 나눈다",
        description: "각자 맡은 분량을 준비해 와서 함께 풀어 갑니다.",
      },
      {
        title: "결과물을 남긴다",
        description: "정리 문서 · 코드 · 발표 자료로 스터디의 흔적을 남깁니다.",
      },
      {
        title: "속도가 다른 사람을 기다린다",
        description: "먼저 간 사람이 뒤따라오는 사람을 돕습니다.",
      },
      { title: "불참은 미리 알린다", description: "빠지게 되면 스터디 전에 리더에게 알립니다." },
    ],
  },
  events: {
    ...OUR_PROMISE,
    items: [
      { title: "시간을 지킨다", description: "시작 시간에 맞춰 모이고, 끝나는 시간을 지킵니다." },
      {
        title: "발표자를 존중한다",
        description: "발표 중에는 집중하고, 질문과 피드백은 건설적으로 합니다.",
      },
      { title: "공간을 원상복구한다", description: "사용한 공간은 처음 상태로 정리하고 떠납니다." },
      {
        title: "기록물은 동의 후 공유한다",
        description: "사진 · 영상은 당사자 동의를 받은 뒤에 올립니다.",
      },
    ],
  },
  members: {
    ...OUR_PROMISE,
    items: [
      {
        title: "이력은 사실만 적는다",
        description: "카드에 적힌 이력은 모두 실제로 한 활동입니다.",
      },
      {
        title: "공개는 본인 동의가 기준이다",
        description: "본인이 동의한 정보만 사이트에 공개합니다.",
      },
      {
        title: "졸업해도 연결된다",
        description: "활동을 마친 시니어도 언제든 함께하는 커뮤니티입니다.",
      },
    ],
  },
} as const satisfies Record<string, PromiseSet>;

export type PromisePage = keyof typeof PROMISES;
