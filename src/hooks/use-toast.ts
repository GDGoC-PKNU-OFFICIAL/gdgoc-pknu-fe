// src/hooks/use-toast.ts
// 전역 토스트 (FRONT_ARCHITECTURE § 5-6: 전역 상태는 Toast Context 1개뿐). 화면 표시는 components/ui/Toaster.tsx 가 한다.
// hooks 는 components 를 import 할 수 없으므로(레이어 규칙) Context 를 여기에 두고 Toaster 가 이 Context 를 채운다.

import { createContext, useContext } from "react";

/** IA 8-5 의 표시 방식: 성공 · 실패 · 경고 */
export type ToastTone = "success" | "error" | "warning";

export interface ToastApi {
  show: (tone: ToastTone, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** <Toaster> 안에서만 쓴다. 반환 객체는 렌더마다 같은 참조라 effect 의존성에 넣어도 된다 */
export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (toast === null) throw new Error("useToast 는 <Toaster> 안에서만 쓸 수 있습니다.");
  return toast;
}
