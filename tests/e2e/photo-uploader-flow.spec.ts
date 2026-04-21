import { expect, test } from "../support/fixtures/index.js";
import {
  buildAiSuccessBody,
  buildAiTimeoutErrorBody,
  createDeferred,
  readAiRequestMeta
} from "../support/helpers/ai-extraction.js";

test.describe("PhotoUploader flow", () => {
  test("uploads a valid product photo and shows AI draft request status", async ({
    page
  }) => {
    const responseReady = createDeferred();

    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await responseReady.promise;
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-e2e-success")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await expect(page.getByRole("status")).toContainText("사진을 확인하고 있습니다");
    await expect(page.getByRole("status")).toContainText(
      "AI 초안을 요청하고 있습니다"
    );
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "requesting"
    );

    responseReady.resolve();

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "success"
    );
    await expect(page.getByLabel("제목")).toHaveValue("AI가 만든 제목");
    await expect(page.getByLabel("카테고리")).toHaveValue("노트북");
    await expect(page.getByLabel("핵심 스펙")).toHaveValue("M3\n16GB RAM");
  });

  test("separates file type, size, and corruption errors with retry CTA", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "CORRUPTED_IMAGE",
            message: "이미지를 읽을 수 없습니다.",
            requestId: "req-corrupted",
            details: {
              recoveryGuide: "다른 사진으로 다시 시도해 주세요.",
              retryable: true
            }
          }
        })
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "product.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image")
    });

    await expect(
      page.getByRole("alert").filter({ hasText: "지원하지 않는 파일 형식" })
    ).toContainText("지원하지 않는 파일 형식");
    await expect(page.getByRole("button", { name: "다른 사진으로 재시도" })).toBeVisible();

    await page.getByRole("button", { name: "다른 사진으로 재시도" }).click();
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "too-large.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(16 * 1024 * 1024)
    });

    await expect(
      page.getByRole("alert").filter({ hasText: "파일 용량이 너무 큽니다" })
    ).toContainText("파일 용량이 너무 큽니다");

    await page.getByRole("button", { name: "다른 사진으로 재시도" }).click();
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "corrupted.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("corrupted-image-fixture")
    });

    await expect(
      page.getByRole("alert").filter({ hasText: "이미지를 읽을 수 없습니다" })
    ).toContainText("이미지를 읽을 수 없습니다");
    await expect(page.getByRole("button", { name: "다른 사진으로 재시도" })).toBeVisible();
  });

  test("switches to manual input with one tap after AI timeout", async ({ page }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: buildAiTimeoutErrorBody("req-timeout")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
    await expect(page.getByLabel("제목")).toBeEditable();
    await expect(page.getByLabel("카테고리")).toBeEditable();
    await expect(page.getByLabel("핵심 스펙")).toBeEditable();
  });

  test("ignores a late AI response after fallback and preserves manual edits", async ({
    page
  }) => {
    const lateResponse = createDeferred();

    await page.route("**/api/ai/extractions", async (route) => {
      await lateResponse.promise;
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "success",
            clientRequestId: "stale-client-request",
            idempotencyKey: "idem-late",
            requestVersion: 1,
            draft: {
              title: "AI가 늦게 만든 제목",
              category: "노트북",
              keySpecifications: ["M4", "16GB"],
              confidence: 0.88,
              fallbackRecommended: false
            }
          },
          meta: {
            requestId: "req-late"
          }
        })
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();
    await page.getByLabel("제목").fill("사용자가 직접 입력한 제목");
    await page.getByLabel("카테고리").fill("카메라");
    await page.getByLabel("핵심 스펙").fill("사용자 입력 스펙");

    lateResponse.resolve();

    await expect(page.getByLabel("제목")).toHaveValue("사용자가 직접 입력한 제목");
    await expect(page.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(page.getByLabel("핵심 스펙")).toHaveValue("사용자 입력 스펙");
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
  });

  test("keeps the newer upload result when an older request fails late", async ({
    page
  }) => {
    const firstRequestReady = createDeferred();
    let requestCount = 0;

    await page.route("**/api/ai/extractions", async (route) => {
      requestCount += 1;

      if (requestCount === 1) {
        await firstRequestReady.promise;

        await route.fulfill({
          status: 504,
          contentType: "application/json",
          body: buildAiTimeoutErrorBody("req-first-timeout")
        });
        return;
      }

      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-second-success")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "first-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("first-fake-jpeg-bytes")
    });
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "requesting"
    );

    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "second-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("second-fake-jpeg-bytes")
    });

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "success"
    );
    firstRequestReady.resolve();

    await expect(page.getByTestId("photo-uploader").getByRole("alert")).toHaveCount(
      0
    );
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "success"
    );
    await expect(page.getByLabel("제목")).toHaveValue("AI가 만든 제목");
  });
});
