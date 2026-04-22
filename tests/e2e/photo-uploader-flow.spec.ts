import { expect, test } from "../support/fixtures/index.js";
import type { Page } from "@playwright/test";
import {
  buildAiSuccessBody,
  buildLowConfidenceAiSuccessBody,
  buildAiTimeoutErrorBody,
  createDeferred,
  readAiRequestMeta
} from "../support/helpers/ai-extraction.js";

async function uploadProductPhoto(page: Page) {
  await page.getByLabel("상품 사진 업로드").setInputFiles({
    name: "macbook-photo.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-jpeg-bytes")
  });
}

async function fillManualListingFields(
  page: Page,
  title: string
) {
  await page.getByLabel("제목").fill(title);
  await page.getByLabel("카테고리").fill("카메라");
  await page.getByLabel("핵심 스펙").fill("바디 단품\n셔터 1200컷");
  await page.getByLabel("가격 (원)").fill("880000");
  await page.getByLabel("판매중").check();
}

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
    await expect(page.getByTestId("extraction-field-editor")).toBeVisible();
    await expect(page.getByTestId("extraction-confidence-label")).toContainText(
      "높음 82%"
    );
    await expect(page.getByTestId("listing-final-fields").getByLabel("제목")).toHaveValue(
      ""
    );
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("카테고리")
    ).toHaveValue("");
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("핵심 스펙")
    ).toHaveValue("");
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
    await expect(page.getByTestId("listing-final-fields").getByLabel("제목")).toBeEditable();
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("카테고리")
    ).toBeEditable();
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("핵심 스펙")
    ).toBeEditable();
  });

  test("completes registration after one-tap fallback from AI timeout", async ({
    page
  }) => {
    const title = "수동 fallback 카메라 timeout completion";

    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: buildAiTimeoutErrorBody("req-fallback-completion")
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);
    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
    await expect(page.getByLabel("가격 (원)")).toBeEditable();

    await fillManualListingFields(page, title);
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
    await expect(page.getByTestId("listing-detail-category")).toHaveText("카메라");
    await expect(page.getByTestId("listing-detail-price")).toHaveText("880,000원");
    await expect(page.getByTestId("listing-detail-status")).toHaveText("판매중");
    await expect(page.getByTestId("listing-detail-specification")).toHaveText([
      "바디 단품",
      "셔터 1200컷"
    ]);
  });

  test("offers manual fallback for low-confidence AI drafts without applying them", async ({
    page
  }) => {
    const title = "저신뢰 fallback 수동 입력 completion";

    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildLowConfidenceAiSuccessBody(meta, "req-low-confidence")
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);

    await expect(page.getByRole("status")).toContainText("신뢰도가 낮습니다");
    await expect(page.getByRole("button", { name: "수동 입력으로 계속" })).toBeVisible();
    await expect(page.getByLabel("제목")).not.toHaveValue("신뢰 낮은 AI 제목");
    await expect(page.getByLabel("카테고리")).not.toHaveValue("노트북");

    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();
    await fillManualListingFields(page, title);
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
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
    const finalFields = page.getByTestId("listing-final-fields");

    await finalFields.getByLabel("제목").fill("사용자가 직접 입력한 제목");
    await finalFields.getByLabel("카테고리").fill("카메라");
    await finalFields.getByLabel("핵심 스펙").fill("사용자 입력 스펙");

    lateResponse.resolve();

    await expect(finalFields.getByLabel("제목")).toHaveValue(
      "사용자가 직접 입력한 제목"
    );
    await expect(finalFields.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(finalFields.getByLabel("핵심 스펙")).toHaveValue(
      "사용자 입력 스펙"
    );
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
  });

  test("ignores a late AI error after fallback and preserves manual completion fields", async ({
    page
  }) => {
    const lateError = createDeferred();
    const title = "late-error-preserved-manual-title";

    await page.route("**/api/ai/extractions", async (route) => {
      await lateError.promise;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "AI_UNAVAILABLE",
            message: "AI 서비스를 사용할 수 없습니다.",
            requestId: "req-late-error",
            details: {
              recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다.",
              retryable: true
            }
          }
        })
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);
    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();
    await fillManualListingFields(page, title);

    lateError.resolve();

    await expect(
      page.getByRole("alert").filter({ hasText: "AI 서비스를 사용할 수 없습니다" })
    ).toHaveCount(0);
    await expect(page.getByLabel("제목")).toHaveValue(title);
    await expect(page.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(page.getByLabel("핵심 스펙")).toHaveValue("바디 단품\n셔터 1200컷");
    await expect(page.getByLabel("가격 (원)")).toHaveValue("880000");
    await expect(page.getByLabel("판매중")).toBeChecked();
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
    await expect(page.getByTestId("extraction-field-editor")).toBeVisible();
    await expect(
      page.getByTestId("extraction-field-editor").getByLabel("AI 초안 제목")
    ).toHaveValue("AI가 만든 제목");
    await expect(page.getByTestId("listing-final-fields").getByLabel("제목")).toHaveValue(
      ""
    );
  });

  test("ignores an older AI response after a later invalid file selection", async ({
    page
  }) => {
    const lateResponse = createDeferred();

    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await lateResponse.promise;
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-invalid-selection-late")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "first-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "requesting"
    );

    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "product.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image")
    });
    await expect(
      page.getByRole("alert").filter({ hasText: "지원하지 않는 파일 형식" })
    ).toContainText("지원하지 않는 파일 형식");

    lateResponse.resolve();

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "error"
    );
    await expect(page.getByTestId("listing-final-fields").getByLabel("제목")).toHaveValue(
      ""
    );
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("카테고리")
    ).toHaveValue("");
    await expect(
      page.getByTestId("listing-final-fields").getByLabel("핵심 스펙")
    ).toHaveValue("");
  });
});
