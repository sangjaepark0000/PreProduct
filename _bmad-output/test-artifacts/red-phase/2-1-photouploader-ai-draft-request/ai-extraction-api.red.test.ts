import {
  aiExtractionRequestMeta,
  buildAiExtractionFormData,
  createAiExtractionTestFile
} from "./ai-extraction-test-data";

const apiBaseUrl = process.env.PREPRODUCT_ATDD_BASE_URL ?? "http://127.0.0.1:3000";

async function postAiExtraction(formData: FormData): Promise<Response> {
  return fetch(`${apiBaseUrl}/api/ai/extractions`, {
    method: "POST",
    body: formData
  });
}

describe("Story 2.1 red-phase AI extraction API contract", () => {
  test.skip("[P0] accepts a valid product photo and returns the AI draft envelope", async () => {
    const response = await postAiExtraction(buildAiExtractionFormData());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        status: "requesting",
        clientRequestId: aiExtractionRequestMeta.clientRequestId,
        idempotencyKey: aiExtractionRequestMeta.idempotencyKey,
        requestVersion: aiExtractionRequestMeta.requestVersion,
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

  test.skip("[P1] classifies invalid file type with retry guidance", async () => {
    const response = await postAiExtraction(
      buildAiExtractionFormData(
        createAiExtractionTestFile({
          name: "product.txt",
          type: "text/plain",
          contents: "not an image"
        })
      )
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "INVALID_FILE_TYPE",
        message: expect.any(String),
        requestId: expect.any(String),
        details: {
          recoveryGuide: expect.stringContaining("이미지"),
          retryable: true
        }
      }
    });
  });

  test.skip("[P1] classifies oversized image with retry guidance", async () => {
    const response = await postAiExtraction(
      buildAiExtractionFormData(
        createAiExtractionTestFile({
          name: "oversized-product.jpg",
          type: "image/jpeg",
          sizeBytes: 16 * 1024 * 1024
        })
      )
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "FILE_TOO_LARGE",
        message: expect.any(String),
        requestId: expect.any(String),
        details: {
          maxBytes: expect.any(Number),
          retryable: true
        }
      }
    });
  });

  test.skip("[P1] classifies corrupted image without collapsing into a generic error", async () => {
    const response = await postAiExtraction(
      buildAiExtractionFormData(
        createAiExtractionTestFile({
          name: "corrupted-product.jpg",
          type: "image/jpeg",
          contents: "corrupted-image-fixture"
        }),
        {
          ...aiExtractionRequestMeta,
          clientRequestId: "client-req-corrupted-image",
          idempotencyKey: "idem-story-2-1-corrupted"
        }
      )
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "CORRUPTED_IMAGE",
        message: expect.any(String),
        requestId: expect.any(String),
        details: {
          recoveryGuide: expect.stringContaining("다른 사진"),
          retryable: true
        }
      }
    });
  });

  test.skip("[P0] returns one consistent terminal result for duplicate idempotency keys", async () => {
    const firstRequest = buildAiExtractionFormData();
    const duplicateRequest = buildAiExtractionFormData();

    const [firstResponse, duplicateResponse] = await Promise.all([
      postAiExtraction(firstRequest),
      postAiExtraction(duplicateRequest)
    ]);

    expect(firstResponse.status).toBe(202);
    expect(duplicateResponse.status).toBe(202);

    const [firstBody, duplicateBody] = await Promise.all([
      firstResponse.json(),
      duplicateResponse.json()
    ]);

    expect(duplicateBody).toMatchObject({
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
});
