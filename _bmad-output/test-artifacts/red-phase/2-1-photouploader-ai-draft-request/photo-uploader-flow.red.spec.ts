import { expect, test } from "@playwright/test";

test.describe("Story 2.1 red-phase PhotoUploader flow", () => {
  test.skip("[P0] uploads a valid product photo and shows AI draft request status", async ({
    page
  }) => {
    await page.goto("/listings/new");

    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await expect(page.getByRole("status")).toContainText("사진을 확인하고 있습니다");
    await expect(page.getByRole("status")).toContainText("AI 초안을 요청하고 있습니다");
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "requesting"
    );
  });

  test.skip("[P1] separates file type, size, and corruption errors with immediate retry CTA", async ({
    page
  }) => {
    await page.goto("/listings/new");

    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "product.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image")
    });

    await expect(page.getByRole("alert")).toContainText("지원하지 않는 파일 형식");
    await expect(page.getByRole("button", { name: "다른 사진으로 재시도" })).toBeVisible();

    await page.getByRole("button", { name: "다른 사진으로 재시도" }).click();
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "too-large.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(16 * 1024 * 1024)
    });

    await expect(page.getByRole("alert")).toContainText("파일 용량이 너무 큽니다");

    await page.getByRole("button", { name: "다른 사진으로 재시도" }).click();
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "corrupted.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("corrupted-image-fixture")
    });

    await expect(page.getByRole("alert")).toContainText("이미지를 읽을 수 없습니다");
    await expect(page.getByRole("button", { name: "다른 사진으로 재시도" })).toBeVisible();
  });

  test.skip("[P0] switches to manual input with one tap after AI timeout", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "AI_TIMEOUT",
            message: "AI 초안 생성 시간이 초과되었습니다.",
            requestId: "req-timeout",
            details: {
              recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다.",
              retryable: true
            }
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

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
    await expect(page.getByLabel("제목")).toBeEditable();
    await expect(page.getByLabel("카테고리")).toBeEditable();
    await expect(page.getByLabel("핵심 스펙")).toBeEditable();
  });

  test.skip("[P0] ignores a late AI response after fallback and preserves manual edits", async ({
    page
  }) => {
    let releaseLateResponse: (() => void) | undefined;
    const lateResponse = new Promise<void>((resolve) => {
      releaseLateResponse = resolve;
    });

    await page.route("**/api/ai/extractions", async (route) => {
      await lateResponse;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "success",
            clientRequestId: "stale-client-request",
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

    releaseLateResponse?.();

    await expect(page.getByLabel("제목")).toHaveValue("사용자가 직접 입력한 제목");
    await expect(page.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(page.getByLabel("핵심 스펙")).toHaveValue("사용자 입력 스펙");
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
  });
});
