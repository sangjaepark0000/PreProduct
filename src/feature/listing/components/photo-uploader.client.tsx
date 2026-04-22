"use client";

import { useRef, useState, type ChangeEvent } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";

import {
  aiExtractionAllowedMimeTypes,
  aiExtractionMaxFileBytes,
  type AiExtractionErrorCode,
  type AiExtractionErrorEnvelope,
  type AiExtractionResult,
  type AiExtractionStatus,
  type AiExtractionSuccessEnvelope
} from "@/shared/contracts/ai-extraction";

type PhotoUploaderProps = {
  onDraftReady: (result: AiExtractionResult) => boolean;
  onFallback: () => void;
};

type UploadError = {
  code: AiExtractionErrorCode;
  message: string;
  recoveryGuide: string;
};

const errorCopyByCode: Partial<Record<AiExtractionErrorCode, UploadError>> = {
  INVALID_FILE_TYPE: {
    code: "INVALID_FILE_TYPE",
    message: "지원하지 않는 파일 형식입니다.",
    recoveryGuide: "JPG, PNG, WebP 이미지로 다시 업로드해 주세요."
  },
  FILE_TOO_LARGE: {
    code: "FILE_TOO_LARGE",
    message: "파일 용량이 너무 큽니다.",
    recoveryGuide: "10MB 이하의 다른 사진으로 다시 시도해 주세요."
  },
  CORRUPTED_IMAGE: {
    code: "CORRUPTED_IMAGE",
    message: "이미지를 읽을 수 없습니다.",
    recoveryGuide: "다른 사진으로 다시 시도해 주세요."
  },
  AI_TIMEOUT: {
    code: "AI_TIMEOUT",
    message: "AI 초안 생성 시간이 초과되었습니다.",
    recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다."
  },
  AI_UNAVAILABLE: {
    code: "AI_UNAVAILABLE",
    message: "AI 초안 생성 서비스를 사용할 수 없습니다.",
    recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다."
  }
};

const visuallyHiddenSx = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1
} as const;

function buildClientRequestId(): string {
  return `client-${crypto.randomUUID()}`;
}

function buildIdempotencyKey(file: File, clientRequestId: string): string {
  return `${clientRequestId}:${file.name}:${file.size}:${file.lastModified}`;
}

function mapClientValidationError(file: File): UploadError | null {
  if (!aiExtractionAllowedMimeTypes.includes(file.type as never)) {
    return errorCopyByCode.INVALID_FILE_TYPE ?? null;
  }

  if (file.size > aiExtractionMaxFileBytes) {
    return errorCopyByCode.FILE_TOO_LARGE ?? null;
  }

  if (file.size === 0) {
    return errorCopyByCode.CORRUPTED_IMAGE ?? null;
  }

  return null;
}

function getStatusText(status: AiExtractionStatus, successMessage: string): string {
  if (status === "validating") {
    return "사진을 확인하고 있습니다.";
  }

  if (status === "requesting") {
    return "사진을 확인하고 있습니다. AI 초안을 요청하고 있습니다.";
  }

  if (status === "success") {
    return successMessage;
  }

  if (status === "error") {
    return "사진 업로드 또는 AI 초안 요청에 실패했습니다.";
  }

  if (status === "fallback") {
    return "수동 입력으로 계속 진행합니다.";
  }

  return "상품 사진을 업로드하면 AI 초안 요청을 시작합니다.";
}

export function PhotoUploader({ onDraftReady, onFallback }: PhotoUploaderProps) {
  const [status, setStatus] = useState<AiExtractionStatus>("idle");
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [successMessage, setSuccessMessage] = useState(
    "AI 초안이 검토 화면에 표시되었습니다."
  );
  const [inputKey, setInputKey] = useState(0);
  const requestVersionRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fallbackActiveRef = useRef(false);

  function invalidateCurrentRequest() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestVersionRef.current += 1;
  }

  function resetForRetry() {
    invalidateCurrentRequest();
    fallbackActiveRef.current = false;
    setStatus("idle");
    setUploadError(null);
    setSuccessMessage("AI 초안이 검토 화면에 표시되었습니다.");
    setInputKey((current) => current + 1);
  }

  function switchToFallback() {
    invalidateCurrentRequest();
    fallbackActiveRef.current = true;
    setUploadError(null);
    setSuccessMessage("AI 초안이 검토 화면에 표시되었습니다.");
    setStatus("fallback");
    onFallback();
  }

  async function requestDraft(file: File) {
    const clientRequestId = buildClientRequestId();
    const requestVersion = requestVersionRef.current + 1;
    const abortController = new AbortController();
    const isCurrentRequest = () =>
      requestVersionRef.current === requestVersion && !fallbackActiveRef.current;
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, 10_000);

    abortControllerRef.current?.abort();
    requestVersionRef.current = requestVersion;
    abortControllerRef.current = abortController;
    fallbackActiveRef.current = false;
    setUploadError(null);
    setStatus("validating");
    await Promise.resolve();

    if (!isCurrentRequest()) {
      window.clearTimeout(timeoutId);
      return;
    }

    setStatus("requesting");

    const formData = new FormData();
    formData.set("photo", file);
    formData.set("clientRequestId", clientRequestId);
    formData.set("idempotencyKey", buildIdempotencyKey(file, clientRequestId));
    formData.set("requestVersion", `${requestVersion}`);

    try {
      const response = await fetch("/api/ai/extractions", {
        method: "POST",
        body: formData,
        signal: abortController.signal
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        const body = (await response.json()) as AiExtractionErrorEnvelope;

        if (!isCurrentRequest()) {
          return;
        }

        const code = body.error.code;
        const fallbackCopy = errorCopyByCode[code] ?? {
          code,
          message: body.error.message,
          recoveryGuide:
            body.error.details?.recoveryGuide ??
            "다른 사진으로 재시도하거나 수동 입력으로 계속 진행해 주세요."
        };

        setUploadError(fallbackCopy);
        setStatus("error");
        return;
      }

      const body = (await response.json()) as AiExtractionSuccessEnvelope;
      const isCurrentResponse =
        body.data.clientRequestId === clientRequestId &&
        body.data.requestVersion === requestVersion &&
        isCurrentRequest();

      if (!isCurrentResponse) {
        return;
      }

      const draftAccepted = onDraftReady(body.data);
      setSuccessMessage(
        draftAccepted
          ? "AI 초안이 검토 화면에 표시되었습니다."
          : "수정 중인 AI 초안을 유지했습니다."
      );
      setStatus("success");
    } catch (error) {
      window.clearTimeout(timeoutId);

      if (!isCurrentRequest()) {
        return;
      }

      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const copy = isAbortError
        ? errorCopyByCode.AI_TIMEOUT
        : errorCopyByCode.AI_UNAVAILABLE;

      if (copy) {
        setUploadError(copy);
      }

      setStatus("error");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);

    if (!file) {
      return;
    }

    const validationError = mapClientValidationError(file);

    if (validationError) {
      invalidateCurrentRequest();
      fallbackActiveRef.current = false;
      setUploadError(validationError);
      setStatus("error");
      return;
    }

    void requestDraft(file);
  }

  const showProgress = status === "validating" || status === "requesting";
  const canFallback = status === "requesting" || status === "error";

  return (
    <Box
      data-testid="photo-uploader"
      sx={{
        border: "1px solid rgba(11, 110, 153, 0.18)",
        p: { xs: 2, md: 3 }
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h5">
            사진으로 AI 초안 시작
          </Typography>
          <Typography color="text.secondary" variant="body2">
            상품 사진을 올리면 제목, 카테고리, 핵심 스펙 초안을 제안합니다.
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ minHeight: 44 }}
          >
            상품 사진 업로드
            <Box
              key={inputKey}
              component="input"
              type="file"
              accept={aiExtractionAllowedMimeTypes.join(",")}
              aria-label="상품 사진 업로드"
              onChange={handleFileChange}
              sx={visuallyHiddenSx}
            />
          </Button>

          {showProgress ? <CircularProgress size={24} aria-label="요청 진행 중" /> : null}

          {canFallback ? (
            <Button
              type="button"
              variant="outlined"
              startIcon={<EditNoteIcon />}
              onClick={switchToFallback}
              sx={{ minHeight: 44 }}
            >
              수동 입력으로 계속
            </Button>
          ) : null}
        </Stack>

        <Typography
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="photo-uploader-status"
          variant="body2"
          color={status === "error" ? "error.main" : "text.secondary"}
        >
          {getStatusText(status, successMessage)}
        </Typography>
        <Box data-testid="photo-uploader-request-state" sx={visuallyHiddenSx}>
          {status}
        </Box>

        {uploadError ? (
          <Alert
            role="alert"
            severity="error"
            action={
              <Button
                type="button"
                color="inherit"
                startIcon={<ReplayIcon />}
                onClick={resetForRetry}
                sx={{ minHeight: 44 }}
              >
                다른 사진으로 재시도
              </Button>
            }
          >
            <AlertTitle>{uploadError.message}</AlertTitle>
            {uploadError.recoveryGuide}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
