import {
  type AiExtractionDraft,
  type AiExtractionRequest,
  type AiExtractionResult
} from "@/shared/contracts/ai-extraction";

type StoredExtraction = {
  result: AiExtractionResult;
  processingCount: number;
};

const extractionsByIdempotencyKey = new Map<string, StoredExtraction>();

function buildDeterministicDraft(): AiExtractionDraft {
  return {
    title: "사진 기반 AI 초안",
    category: "노트북",
    keySpecifications: ["상태 확인 필요", "사진 기반 자동 초안"],
    confidence: 0.72,
    fallbackRecommended: false
  };
}

export function resetAiExtractionServiceState() {
  extractionsByIdempotencyKey.clear();
}

export async function requestAiExtractionDraft(
  request: AiExtractionRequest
): Promise<{
  result: AiExtractionResult;
  duplicate: boolean;
  processingCount: number;
}> {
  const existing = extractionsByIdempotencyKey.get(request.idempotencyKey);

  if (existing) {
    return {
      result: existing.result,
      duplicate: true,
      processingCount: existing.processingCount
    };
  }

  const stored: StoredExtraction = {
    processingCount: 1,
    result: {
      status: "requesting",
      clientRequestId: request.clientRequestId,
      idempotencyKey: request.idempotencyKey,
      requestVersion: request.requestVersion,
      draft: buildDeterministicDraft()
    }
  };

  extractionsByIdempotencyKey.set(request.idempotencyKey, stored);

  return {
    result: stored.result,
    duplicate: false,
    processingCount: stored.processingCount
  };
}
