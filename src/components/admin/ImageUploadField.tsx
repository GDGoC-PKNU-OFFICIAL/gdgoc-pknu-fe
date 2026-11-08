"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import SafeImage from "@/components/common/SafeImage";
import Button, { buttonStyles } from "@/components/ui/Button";
import { UPLOAD_LIMITS } from "@/constants/limits";
import { useToast } from "@/hooks/use-toast";
import { presignUpload, uploadToPresignedUrl } from "@/lib/api/admin-api";
import { ApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/cn";
import { IMAGE_CONTENT_TYPES, type ImageContentType, type UploadTarget } from "@/types/api";

import { FormFieldset } from "./FormField";
import { redirectToLogin } from "./lib/redirect-to-login";

/** 업로드 진행 상태. idle 이 아니면 폼 저장을 막는다 (FRONT_ARCHITECTURE § 5-5 · IA F-5) */
export type UploadStatus = "idle" | "uploading" | "failed";

// IA 8-5 문구
const MESSAGES = {
  fileRule: "jpg, png, webp 파일만, 5MB 이하로 올릴 수 있습니다.",
  failed: "이미지 업로드에 실패했습니다. 다시 시도해 주세요.",
  uploading: "업로드 중…",
} as const;

const ACCEPT = IMAGE_CONTENT_TYPES.join(",");

const ASPECT_CLASSES = {
  video: "aspect-video w-full max-w-64",
  square: "aspect-square w-40",
} as const;

function isImageContentType(type: string): type is ImageContentType {
  return (IMAGE_CONTENT_TYPES as readonly string[]).includes(type);
}

/** 서버가 형식 · 신고 용량을 거절한 경우 — 파일 규칙 위반이라 재시도해도 같다 */
function isFileRuleError(error: ApiError): boolean {
  return error.code === "INVALID_FILE_TYPE" || error.code === "FILE_TOO_LARGE";
}

interface ImageUploadFieldProps {
  id: string;
  legend: string;
  /** 파일 키 접두사 결정 — 프로젝트 썸네일 project · 멤버 사진 member */
  target: UploadTarget;
  /** 폼 값 = 업로드 완료된 publicUrl. 없으면 null (기본 이미지) */
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  /** 선택 버튼에 붙는다 — 서버 필드 에러(UPLOAD_VERIFICATION_FAILED) 때 포커스가 여기로 온다 */
  ref?: Ref<HTMLButtonElement>;
  /** public/ 의 기본 이미지 (C-11) */
  fallbackSrc: string;
  /** 미리보기 비율 — 썸네일 16:9 · 프로필 1:1 (PRD 4-4) */
  aspect: keyof typeof ASPECT_CLASSES;
  hint?: ReactNode;
  /** 폼 검증 · 서버 재검증 에러 */
  error?: string;
  onStatusChange?: (status: UploadStatus) => void;
  /** 업로드 요청 직전. 401 로 로그인에 가기 전에 임시 저장해 두는 데 쓴다 (PRD 4-6) */
  onBeforeUpload?: () => void;
}

/**
 * 이미지 업로드 칸 (FRONT_ARCHITECTURE § 5-5 · IA F-5). 프로젝트 썸네일 · 멤버 프로필 사진이 공유한다.
 * ① 형식 · 용량 검사(프론트) → ② presign(BFF 경유) → ③ R2 직접 PUT → ④ publicUrl 만 폼 값에 넣는다.
 * 파일 자체는 폼 값 · 임시 저장본에 남기지 않는다 (IA 8-6). 업로드 중 · 실패 상태에서는 onStatusChange 로 저장을 막게 한다.
 */
export default function ImageUploadField({
  id,
  legend,
  target,
  value,
  onChange,
  onBlur,
  ref,
  fallbackSrc,
  aspect,
  hint,
  error,
  onStatusChange,
  onBeforeUpload,
}: ImageUploadFieldProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [localError, setLocalError] = useState<string | null>(null);
  /** 업로드 중 · 실패 시 보여 줄 선택한 파일의 로컬 미리보기 (blob: URL) */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  /** 실패 후 "다시 시도" 할 파일 */
  const [failedFile, setFailedFile] = useState<File | null>(null);

  const statusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    statusChangeRef.current = onStatusChange;
  });
  useEffect(() => {
    statusChangeRef.current?.(status);
  }, [status]);

  // blob: URL 은 바뀌거나 언마운트될 때 해제한다
  useEffect(() => {
    if (previewUrl === null) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // 화면을 떠나면 진행 중인 업로드를 끊는다
  useEffect(() => () => abortRef.current?.abort(), []);

  function reset() {
    setStatus("idle");
    setPreviewUrl(null);
    setFailedFile(null);
  }

  async function upload(file: File) {
    setLocalError(null);
    if (!isImageContentType(file.type) || file.size > UPLOAD_LIMITS.maxFileSizeBytes) {
      setLocalError(MESSAGES.fileRule);
      return;
    }
    const contentType = file.type;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("uploading");
    setFailedFile(null);
    setPreviewUrl(URL.createObjectURL(file));
    onBeforeUpload?.();

    try {
      const { uploadUrl, publicUrl } = await presignUpload({
        target,
        contentType,
        size: file.size,
      });
      if (controller.signal.aborted) return;
      await uploadToPresignedUrl(uploadUrl, file, contentType, controller.signal);
      if (controller.signal.aborted) return;
      onChange(publicUrl);
      reset();
    } catch (cause) {
      if (controller.signal.aborted) return;
      if (cause instanceof ApiError && cause.status === 401) {
        // 이동하는 동안 업로드 중 상태를 유지해 저장 버튼이 눌리지 않게 한다
        redirectToLogin(cause.code === "TOKEN_EXPIRED");
        return;
      }
      if (cause instanceof ApiError && isFileRuleError(cause)) {
        // 파일 문제라 다시 시도할 수 없다 — 기존 값은 그대로 두고 칸에 안내만 한다
        reset();
        setLocalError(MESSAGES.fileRule);
        return;
      }
      if (!(cause instanceof ApiError))
        console.error("[admin] 이미지 업로드 중 알 수 없는 오류", cause);
      toast.error(MESSAGES.failed);
      setStatus("failed");
      setFailedFile(file);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  function cancelFailed() {
    reset();
    setLocalError(null);
  }

  const uploading = status === "uploading";
  const shownError = localError ?? (status === "failed" ? MESSAGES.failed : error);
  const imageSrc = previewUrl ?? value;

  return (
    <FormFieldset id={id} legend={legend} hint={hint} error={shownError}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-line bg-surface-muted",
            ASPECT_CLASSES[aspect],
            shownError && "border-brand-red",
          )}
        >
          <SafeImage
            // 다른 파일로 바뀌면 SafeImage 의 실패 기억을 새로 시작한다
            key={imageSrc ?? "fallback"}
            src={imageSrc}
            fallbackSrc={fallbackSrc}
            // blob: 미리보기는 이미지 최적화 대상이 아니다
            unoptimized={previewUrl !== null}
            alt={previewUrl ? "선택한 이미지 미리보기" : value ? `현재 ${legend}` : "기본 이미지"}
            fill
            sizes="256px"
            className={cn("object-cover", uploading && "opacity-50")}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-surface/90 px-3 py-1 text-xs font-medium">
                {MESSAGES.uploading}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              // 같은 파일을 다시 골라도 change 가 일어나도록 비운다
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
          {status === "failed" && failedFile ? (
            <>
              <Button onClick={() => void upload(failedFile)}>다시 시도</Button>
              <Button variant="secondary" onClick={cancelFailed}>
                선택 취소
              </Button>
            </>
          ) : (
            <>
              <button
                ref={ref}
                type="button"
                disabled={uploading}
                aria-describedby={shownError ? `${id}-error` : undefined}
                onClick={() => inputRef.current?.click()}
                onBlur={onBlur}
                className={buttonStyles({ variant: "secondary" })}
              >
                {value ? "이미지 변경" : "이미지 선택"}
              </button>
              {value !== null && !uploading && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocalError(null);
                    onChange(null);
                  }}
                >
                  이미지 제거
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {uploading ? MESSAGES.uploading : ""}
      </p>
    </FormFieldset>
  );
}
