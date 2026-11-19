// src/lib/theme.ts
// 라이트 / 다크 테마. <html data-theme="light|dark"> 로 표시하고, 고른 값은 브라우저(localStorage)에 남긴다.
// 기본은 라이트다. 관리자 화면(/admin)은 항상 라이트다.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "gdgoc-theme";

/** 저장된 테마. 없거나 읽을 수 없으면(사생활 보호 모드 등) 라이트 */
export function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 저장하지 못해도 지금 화면에는 적용된다
  }
}

/**
 * 첫 화면이 그려지기 전에 <head> 에서 실행하는 스크립트. 다크를 고른 사람이 새로고침할 때
 * 흰 화면이 잠깐 번쩍이지 않게 한다. React 가 뜨기 전에 돌아야 해서 문자열로 둔다 (위 함수들과 같은 규칙).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname;if(p==="/admin"||p.indexOf("/admin/")===0)return;if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")document.documentElement.dataset.theme="dark";}catch(e){}})();`;
