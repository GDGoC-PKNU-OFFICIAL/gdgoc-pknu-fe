// src/features/about/lib/rule-markdown.ts
// 활동 규칙 본문 ↔ 마크다운. 관리자는 본문을 마크다운 한 칸으로 고치고, 화면은 해석한 구조(RuleDoc)로 그린다.
//
// 쓰는 문법만 해석한다 (나머지 줄은 문단):
//   > 글           맨 위면 안내 상자(intro), 마지막 소제목 뒤 맨 끝이면 강조 문구(note)
//   ## 소제목      구역 시작
//   글             목록 앞이면 소제목 아래 설명(lead), 목록 뒤면 끝 문장(after)
//   - 항목         목록. 두 칸(이상) 들여 쓴 "- 항목"은 바로 위 항목의 하위 목록
//   1. 항목        번호 목록
//   **굵게**       본문 안에서 굵게 (그리는 쪽이 처리)

import type { RuleDoc, RuleItem, RuleSection } from "@/data/rules";

type ParsedRule = Pick<RuleDoc, "intro" | "sections" | "note">;

/** 마크다운 → 규칙 구조 */
export function parseRuleMarkdown(markdown: string): ParsedRule {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const sections: RuleSection[] = [];
  let intro: string | undefined;
  let note: string | undefined;
  let current: RuleSection | null = null;

  for (const raw of lines) {
    if (raw.trim() === "") continue;
    const quote = /^\s*>\s?(.*)$/.exec(raw);
    if (quote) {
      const text = quote[1].trim();
      if (current === null) intro = intro ? `${intro} ${text}` : text;
      else note = note ? `${note} ${text}` : text;
      continue;
    }
    const heading = /^\s*#{1,3}\s+(.*)$/.exec(raw);
    if (heading) {
      current = { heading: heading[1].trim() };
      sections.push(current);
      note = undefined; // 강조 문구는 문서 맨 끝의 > 만
      continue;
    }
    if (current === null) {
      // 소제목 앞의 일반 문단은 안내 상자로 본다
      intro = intro ? `${intro} ${raw.trim()}` : raw.trim();
      continue;
    }
    const sub = /^(\s{2,}|\t)[-*]\s+(.*)$/.exec(raw);
    const bullet = /^[-*]\s+(.*)$/.exec(raw.trimStart() === raw ? raw : "");
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(raw);
    if (sub && current.items && current.items.length > 0) {
      const last = current.items[current.items.length - 1];
      const parent = typeof last === "string" ? { text: last, sub: [] as string[] } : last;
      parent.sub.push(sub[2].trim());
      current.items[current.items.length - 1] = parent;
      continue;
    }
    if (bullet || ordered || sub) {
      current.items ??= [];
      if (ordered) current.ordered = true;
      current.items.push((bullet?.[1] ?? ordered?.[1] ?? sub?.[2] ?? "").trim());
      continue;
    }
    // 일반 문단 — 목록 전이면 lead, 목록 뒤면 after
    const text = raw.trim();
    if (current.items && current.items.length > 0) {
      current.after = current.after ? `${current.after} ${text}` : text;
    } else {
      current.lead = current.lead ? `${current.lead} ${text}` : text;
    }
  }

  return { intro, sections, note };
}

/** 규칙 구조 → 마크다운 (코드에 들어 있는 기본 규칙을 관리자 폼에 처음 채울 때) */
export function ruleToMarkdown(doc: Pick<RuleDoc, "intro" | "sections" | "note">): string {
  const out: string[] = [];
  if (doc.intro) out.push(`> ${doc.intro}`, "");
  for (const section of doc.sections) {
    out.push(`## ${section.heading}`, "");
    if (section.lead) out.push(section.lead, "");
    if (section.items?.length) {
      section.items.forEach((item: RuleItem, index) => {
        const marker = section.ordered ? `${index + 1}.` : "-";
        if (typeof item === "string") {
          out.push(`${marker} ${item}`);
        } else {
          out.push(`${marker} ${item.text}`);
          for (const child of item.sub) out.push(`  - ${child}`);
        }
      });
      out.push("");
    }
    if (section.after) out.push(section.after, "");
  }
  if (doc.note) out.push(`> ${doc.note}`);
  return out.join("\n").trim();
}
