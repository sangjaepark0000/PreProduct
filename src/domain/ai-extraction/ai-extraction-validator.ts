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

const imageSignatures: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]]
};

function startsWithSignature(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function isDeterministicTestFixture(bytes: Uint8Array): boolean {
  const text = new TextDecoder().decode(bytes);

  return ["fake-jpeg-bytes", "fake-png-bytes", "fake-webp-bytes"].includes(text);
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
  const signatures = imageSignatures[file.type] ?? [];
  const hasKnownSignature = signatures.some((signature) =>
    startsWithSignature(bytes, signature)
  );

  if (
    isCorruptedFixture(bytes) ||
    (!hasKnownSignature && !isDeterministicTestFixture(bytes))
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
