// src/data/faq.ts
// P-01 About 의 FAQ (IA 4장 P-01 #6). 신입 지원자의 핵심 질문(PRD 2장)을 먼저 둔다.
//
// TODO(운영진): 답변은 초안이다. 모집 시기 · 활동 강도를 실제 운영 기준으로 확정할 것.

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ = {
  badge: "자주 묻는 질문",
  title: "FAQ",
  items: [
    {
      question: "개발 실력이 부족해도 참여할 수 있나요?",
      answer:
        "네. 실력보다 함께 배우려는 태도를 봅니다. 비전공자와 1 · 2학년도 스터디에서 기초부터 시작할 수 있습니다.",
    },
    {
      question: "활동은 얼마나 자주 하나요?",
      answer:
        "정기 세션은 격주, 파트 스터디는 학기 중 주 1회 진행합니다. 학기 프로젝트는 팀별로 일정을 정합니다. 자세한 일정은 Events 캘린더에서 볼 수 있습니다.",
    },
    {
      question: "언제 모집하나요?",
      answer:
        "모집 여부와 기간은 홈 화면 상단의 모집 배너에 안내합니다. 모집 소식은 Discord 와 Instagram 에서도 가장 먼저 공지합니다.",
    },
    {
      question: "비용이 드나요?",
      answer: "활동 참여 자체에는 별도 비용이 없습니다.",
    },
  ] satisfies FaqItem[],
} as const;
