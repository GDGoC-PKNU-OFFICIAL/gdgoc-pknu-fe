// src/data/privacy.ts
// P-06 개인정보처리방침 (PRD 3-4 · IA 4장 P-06).
//
// ⚠️ TODO(운영진): 문안 미확정 (PRD 9-2 · IA 11-1 #2). 학교 · GDG 가이드를 참고해 검토받은 뒤 교체하고,
//    effectiveDate 를 확정 날짜("YYYY-MM-DD")로 채울 것. null 인 동안 화면에 "초안"이 표시된다.

import { SITE } from "./site";

export interface PrivacySection {
  title: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
}

export const PRIVACY = {
  title: "개인정보처리방침",
  description: "GDG on Campus PKNU 웹사이트가 공개 · 수집하는 정보와 그 이용 방법을 안내합니다.",
  /** 시행일 "YYYY-MM-DD". 확정 전에는 null */
  effectiveDate: null as string | null,
  sections: [
    {
      title: "1. 사이트에 공개하는 정보",
      paragraphs: ["사이트에는 동아리 활동을 소개하기 위해 다음 정보를 공개합니다."],
      list: [
        "코어멤버 · 시니어 카드: 프로필 사진, 이름, 학과, 주요 이력, 관심분야, 분야, 한 줄 소개, GitHub · 소개 페이지 링크",
        "프로젝트 팀원 · 스터디 리더와 참여자: 이름",
      ],
    },
    {
      title: "2. 이용 목적",
      list: ["동아리 활동과 구성원 소개", "동아리 활동 기록 보관", "사이트 이용 현황 파악과 개선"],
    },
    {
      title: "3. 공개 동의",
      paragraphs: [
        "코어멤버 · 시니어 카드는 운영진이 본인에게 사이트 공개 동의를 받은 뒤에 등록합니다. 동의를 받지 않은 정보는 공개하지 않습니다.",
      ],
    },
    {
      title: "4. 방문 통계 (Google Analytics 4)",
      paragraphs: [
        "사이트 이용 현황을 파악하기 위해 Google Analytics 4 를 사용합니다. 이 과정에서 쿠키가 사용되며, 방문 페이지 · 클릭한 링크 · 접속 기기와 브라우저 종류 등이 개인을 식별할 수 없는 형태로 수집됩니다.",
        "브라우저 설정에서 쿠키를 차단하거나, Google 이 제공하는 Google Analytics 차단 브라우저 부가 기능을 설치하면 수집을 거부할 수 있습니다.",
      ],
    },
    {
      title: "5. 정보 수정 · 삭제 요청",
      paragraphs: [
        `공개된 본인 정보의 수정이나 삭제를 원하면 ${SITE.contactEmail} 로 요청해 주세요. 확인 후 지체 없이 반영합니다.`,
      ],
    },
  ] satisfies PrivacySection[],
} as const;
