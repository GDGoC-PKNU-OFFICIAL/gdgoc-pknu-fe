// src/components/admin/lib/list-errors.ts
// react-hook-form 의 배열 필드 에러를 화면용으로 펼친다.
// 배열 필드 에러는 모양이 둘이다 — 배열 전체 규칙(개수 · 중복)은 error.message 또는 error.root.message,
// 항목 규칙(빈 값 · 글자 수)은 error[i].message. 두 경우를 한 번에 꺼낸다.

export interface ListErrors {
  /** 배열 전체 에러 */
  message?: string;
  /** 항목별 에러. 인덱스 = 항목 순서 */
  items: (string | undefined)[];
}

function messageOf(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const message = (value as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export function listErrors(error: unknown): ListErrors {
  if (typeof error !== "object" || error === null) return { items: [] };
  const record = error as Record<string, unknown>;
  const items: (string | undefined)[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (/^\d+$/.test(key)) items[Number(key)] = messageOf(value);
  }
  return { message: messageOf(record) ?? messageOf(record.root), items };
}
