// src/lib/auth/cookie.ts
// 관리자 인증 쿠키 (API 명세서 1-3 · PRD 4-3).
// Spring(*.onrender.com)이 구운 쿠키는 Next(*.vercel.app)가 읽을 수 없으므로, Spring 이 준 JWT 를
// Next 가 자기 도메인 쿠키로 다시 굽는다. 쿠키를 쓰고 지우는 곳은 app/api/admin/** Route Handler 뿐이다.

/** 쿠키 이름. proxy.ts · BFF 프록시가 같은 이름으로 읽는다 */
export const ADMIN_COOKIE_NAME = "gdg_admin_token";

/** JWT 만료(8시간)와 같은 값. Spring 의 app.jwt.expiration-hours 를 바꾸면 함께 고친다 */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/**
 * 명세 1-3 쿠키 속성. `secure` 는 로컬에서도 켠다 — Chrome · Firefox 는 http://localhost 를
 * 보안 컨텍스트로 취급해 Secure 쿠키를 받아 준다 (Safari 로 로컬 로그인을 확인할 때만 주의).
 */
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
} as const;

/** 삭제용 옵션. 브라우저는 이름 · path 가 같아야 같은 쿠키로 보므로 속성을 그대로 두고 maxAge 만 0 으로 */
export const EXPIRED_ADMIN_COOKIE_OPTIONS = { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 } as const;
