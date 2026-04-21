import {
  aiExtractionErrorEnvelopeSchema,
  aiExtractionSuccessEnvelopeSchema
} from "@/shared/contracts/ai-extraction";
import { resetAiExtractionServiceState } from "@/domain/ai-extraction/ai-extraction-service";
import { POST } from "@/app/api/ai/extractions/route";

type TestFileOptions = {
  name?: string;
  type?: string;
  sizeBytes?: number;
  contents?: string;
};

const requestMeta = {
  clientRequestId: "client-req-story-2-1",
  idempotencyKey: "idem-story-2-1-photo-001",
  requestVersion: 1
} as const;

function createTestFile({
  name = "macbook-photo.jpg",
  type = "image/jpeg",
  sizeBytes,
  contents = "fake-jpeg-bytes"
}: TestFileOptions = {}): File {
  const payload = sizeBytes
    ? new Uint8Array(sizeBytes)
    : new TextEncoder().encode(contents);

  return new File([payload], name, { type });
}

function buildFormData(
  file = createTestFile(),
  meta = requestMeta
): FormData {
  const formData = new FormData();

  formData.set("photo", file);
  formData.set("clientRequestId", meta.clientRequestId);
  formData.set("idempotencyKey", meta.idempotencyKey);
  formData.set("requestVersion", `${meta.requestVersion}`);

  return formData;
}

function buildRequest(formData: FormData): Request {
  return new Request("http://127.0.0.1:3000/api/ai/extractions", {
    method: "POST",
    body: formData
  });
}

describe("AI extraction API contract", () => {
  beforeEach(() => {
    resetAiExtractionServiceState();
  });

  it("accepts a valid product photo and returns the AI draft envelope", async () => {
    const response = await POST(buildRequest(buildFormData()));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(aiExtractionSuccessEnvelopeSchema.parse(body)).toMatchObject({
      data: {
        status: "requesting",
        clientRequestId: requestMeta.clientRequestId,
        idempotencyKey: requestMeta.idempotencyKey,
        requestVersion: requestMeta.requestVersion,
        draft: {
          title: expect.any(String),
          category: expect.any(String),
          keySpecifications: expect.any(Array),
          confidence: expect.any(Number),
          fallbackRecommended: expect.any(Boolean)
        }
      },
      meta: {
        requestId: expect.any(String)
      }
    });
  });

  it.each([
    {
      status: 415,
      code: "INVALID_FILE_TYPE",
      file: createTestFile({
        name: "product.txt",
        type: "text/plain",
        contents: "not an image"
      })
    },
    {
      status: 413,
      code: "FILE_TOO_LARGE",
      file: createTestFile({
        name: "oversized-product.jpg",
        type: "image/jpeg",
        sizeBytes: 16 * 1024 * 1024
      })
    },
    {
      status: 422,
      code: "CORRUPTED_IMAGE",
      file: createTestFile({
        name: "corrupted-product.jpg",
        type: "image/jpeg",
        contents: "corrupted-image-fixture"
      })
    }
  ])("classifies $code with retry guidance", async ({ status, code, file }) => {
    const response = await POST(buildRequest(buildFormData(file)));
    const body = await response.json();

    expect(response.status).toBe(status);
    expect(aiExtractionErrorEnvelopeSchema.parse(body)).toMatchObject({
      error: {
        code,
        message: expect.any(String),
        requestId: expect.any(String),
        details: {
          recoveryGuide: expect.any(String),
          retryable: true
        }
      }
    });
  });

  it("returns one consistent terminal result for duplicate idempotency keys", async () => {
    const [firstResponse, duplicateResponse] = await Promise.all([
      POST(buildRequest(buildFormData())),
      POST(buildRequest(buildFormData()))
    ]);
    const [firstBody, duplicateBody] = await Promise.all([
      firstResponse.json(),
      duplicateResponse.json()
    ]);

    expect(firstResponse.status).toBe(202);
    expect(duplicateResponse.status).toBe(202);
    expect(aiExtractionSuccessEnvelopeSchema.parse(duplicateBody)).toMatchObject({
      data: {
        idempotencyKey: firstBody.data.idempotencyKey,
        clientRequestId: firstBody.data.clientRequestId,
        requestVersion: firstBody.data.requestVersion,
        status: firstBody.data.status
      },
      meta: {
        duplicate: true
      }
    });
  });

  it("rejects unknown response status values", () => {
    expect(() =>
      aiExtractionSuccessEnvelopeSchema.parse({
        data: {
          status: "unknown",
          clientRequestId: requestMeta.clientRequestId,
          idempotencyKey: requestMeta.idempotencyKey,
          requestVersion: requestMeta.requestVersion,
          draft: {
            title: "초안",
            category: "노트북",
            keySpecifications: ["16GB RAM"],
            confidence: 0.8,
            fallbackRecommended: false
          }
        },
        meta: {
          requestId: "req-invalid-status"
        }
      })
    ).toThrow();
  });
});
