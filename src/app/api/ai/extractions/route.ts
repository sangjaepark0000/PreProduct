import { NextResponse } from "next/server";

import {
  aiExtractionRequestSchema,
  type AiExtractionErrorCode,
  type AiExtractionErrorEnvelope
} from "@/shared/contracts/ai-extraction";
import {
  requestAiExtractionDraft
} from "@/domain/ai-extraction/ai-extraction-service";
import {
  validateAiExtractionPhoto,
  type AiExtractionFileLike
} from "@/domain/ai-extraction/ai-extraction-validator";

function createRequestId(): string {
  return crypto.randomUUID();
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value &&
    "name" in value
  );
}

function errorResponse(
  status: number,
  requestId: string,
  code: AiExtractionErrorCode,
  message: string,
  details?: AiExtractionErrorEnvelope["error"]["details"]
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        requestId
      }
    },
    { status }
  );
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      400,
      requestId,
      "INVALID_REQUEST",
      "AI 초안 요청 형식이 올바르지 않습니다.",
      {
        recoveryGuide: "사진을 다시 선택해 요청을 새로 시작해 주세요.",
        retryable: true
      }
    );
  }

  const photo = formData.get("photo");

  if (!isFileLike(photo)) {
    return errorResponse(
      400,
      requestId,
      "INVALID_REQUEST",
      "상품 사진을 업로드해 주세요.",
      {
        recoveryGuide: "사진을 선택한 뒤 다시 시도해 주세요.",
        retryable: true
      }
    );
  }

  const meta = aiExtractionRequestSchema.safeParse({
    clientRequestId: formData.get("clientRequestId"),
    idempotencyKey: formData.get("idempotencyKey"),
    requestVersion: formData.get("requestVersion")
  });

  if (!meta.success) {
    return errorResponse(
      400,
      requestId,
      "INVALID_REQUEST",
      "AI 초안 요청 정보가 올바르지 않습니다.",
      {
        recoveryGuide: "사진을 다시 선택해 요청을 새로 시작해 주세요.",
        retryable: true
      }
    );
  }

  const validation = await validateAiExtractionPhoto(photo as AiExtractionFileLike);

  if (!validation.ok) {
    return errorResponse(
      validation.error.status,
      requestId,
      validation.error.code,
      validation.error.message,
      validation.error.details
    );
  }

  const extraction = await requestAiExtractionDraft(meta.data);

  return NextResponse.json(
    {
      data: extraction.result,
      meta: {
        requestId,
        ...(extraction.duplicate ? { duplicate: true } : {})
      }
    },
    { status: 202 }
  );
}
