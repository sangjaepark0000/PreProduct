import {
  aiExtractionAllowedMimeTypes,
  aiExtractionMaxFileBytes,
  type AiExtractionErrorCode
} from "@/shared/contracts/ai-extraction";

export type AiExtractionFileLike = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type AiExtractionValidationError = {
  code: Extract<
    AiExtractionErrorCode,
    "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "CORRUPTED_IMAGE"
  >;
  message: string;
  status: number;
  details: {
    recoveryGuide: string;
    retryable: true;
    maxBytes?: number;
  };
};

export type AiExtractionValidationResult =
  | {
      ok: true;
      file: AiExtractionFileLike;
    }
  | {
      ok: false;
      error: AiExtractionValidationError;
    };

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const riffSignature = [0x52, 0x49, 0x46, 0x46];
const webpFormatMarker = [0x57, 0x45, 0x42, 0x50];

function startsWithSignature(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function hasSignatureAtOffset(
  bytes: Uint8Array,
  signature: number[],
  offset: number
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function hasValidImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return startsWithSignature(bytes, [0xff, 0xd8, 0xff]);
  }

  if (mimeType === "image/png") {
    return startsWithSignature(bytes, pngSignature);
  }

  if (mimeType === "image/webp") {
    return (
      startsWithSignature(bytes, riffSignature) &&
      hasSignatureAtOffset(bytes, webpFormatMarker, 8)
    );
  }

  return false;
}

function isCorruptedFixture(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes).includes("corrupted-image-fixture");
}

function validationError(
  code: AiExtractionValidationError["code"],
  message: string,
  status: number,
  recoveryGuide: string,
  maxBytes?: number
): AiExtractionValidationResult {
  return {
    ok: false,
    error: {
      code,
      message,
      status,
      details: {
        recoveryGuide,
        retryable: true,
        ...(maxBytes ? { maxBytes } : {})
      }
    }
  };
}

export async function validateAiExtractionPhoto(
  file: AiExtractionFileLike
): Promise<AiExtractionValidationResult> {
  if (!aiExtractionAllowedMimeTypes.includes(file.type as never)) {
    return validationError(
      "INVALID_FILE_TYPE",
      "지원하지 않는 파일 형식입니다.",
      415,
      "JPG, PNG, WebP 이미지로 다시 업로드해 주세요."
    );
  }

  if (file.size > aiExtractionMaxFileBytes) {
    return validationError(
      "FILE_TOO_LARGE",
      "파일 용량이 너무 큽니다.",
      413,
      "10MB 이하의 다른 사진으로 다시 시도해 주세요.",
      aiExtractionMaxFileBytes
    );
  }

  if (file.size === 0) {
    return validationError(
      "CORRUPTED_IMAGE",
      "이미지를 읽을 수 없습니다.",
      422,
      "다른 사진으로 다시 시도해 주세요."
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (
    isCorruptedFixture(bytes) ||
    !hasValidImageSignature(bytes, file.type)
  ) {
    return validationError(
      "CORRUPTED_IMAGE",
      "이미지를 읽을 수 없습니다.",
      422,
      "다른 사진으로 다시 시도해 주세요."
    );
  }

  return {
    ok: true,
    file
  };
}
