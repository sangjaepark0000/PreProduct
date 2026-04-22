import { expect, test } from "@playwright/test";

function buildAiSuccessBody(requestId: string) {
  return JSON.stringify({
    data: {
      status: "success",
      clientRequestId: "client-req-story-2-2",
      idempotencyKey: "idem-story-2-2-draft-001",
      requestVersion: 2,
      draft: {
        title: "AI가 만든 제목",
        category: "노트북",
        keySpecifications: ["M3", "16GB RAM"],
        confidence: 0.82,
        fallbackRecommended: false
      }
    },
    meta: {
      requestId
    }
  });
}

test.describe("Story 2.2 red-phase ExtractionFieldEditor flow", () => {
  test.skip("[P0] shows the AI draft in the review editor without auto-filling final fields", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody("req-story-2-2-editor")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await expect(page.getByTestId("extraction-field-editor")).toBeVisible();
    await expect(page.getByTestId("extraction-confidence-label")).toContainText(
      "높음 82%"
    );
    await expect(
      page.getByTestId("extraction-field-editor").getByLabel("제목")
    ).toHaveValue("AI가 만든 제목");
    await expect(page.getByLabel("제목").first()).toHaveValue("");
    await expect(page.getByLabel("카테고리").first()).toHaveValue("");
    await expect(page.getByLabel("핵심 스펙").first()).toHaveValue("");
  });

  test.skip("[P0] applies edited draft values to the final listing form only after confirmation", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody("req-story-2-2-confirm")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    const editor = page.getByTestId("extraction-field-editor");
    await editor.getByLabel("제목").fill("사용자가 확정한 제목");
    await editor.getByLabel("카테고리").fill("랩톱");
    await editor.getByLabel("핵심 스펙").fill("M3 Pro\n18GB RAM");
    await page.getByTestId("extraction-confirm-button").click();

    await expect(page.getByLabel("제목").first()).toHaveValue(
      "사용자가 확정한 제목"
    );
    await expect(page.getByLabel("카테고리").first()).toHaveValue("랩톱");
    await expect(page.getByLabel("핵심 스펙").first()).toHaveValue(
      "M3 Pro\n18GB RAM"
    );
    await expect(page.getByRole("status")).toContainText("AI 초안을 확정했습니다");
  });

  test.skip("[P0] blocks confirmation with field-level errors when required review fields are empty", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody("req-story-2-2-validation")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    const editor = page.getByTestId("extraction-field-editor");
    await editor.getByLabel("제목").fill("");
    await editor.getByLabel("카테고리").fill("");
    await editor.getByLabel("핵심 스펙").fill("");
    await page.getByTestId("extraction-confirm-button").click();

    await expect(editor.getByRole("alert")).toContainText("제목");
    await expect(editor.getByRole("alert")).toContainText("카테고리");
    await expect(editor.getByRole("alert")).toContainText("핵심 스펙");
    await expect(page.getByLabel("제목").first()).toHaveValue("");
    await expect(page.getByLabel("카테고리").first()).toHaveValue("");
    await expect(page.getByLabel("핵심 스펙").first()).toHaveValue("");
  });

  test.skip("[P0] ignores stale AI drafts after manual editing or confirmed review state", async ({
    page
  }) => {
    let requestCount = 0;

    await page.route("**/api/ai/extractions", async (route) => {
      requestCount += 1;
      const body =
        requestCount === 1
          ? buildAiSuccessBody("req-story-2-2-current")
          : JSON.stringify({
              data: {
                status: "success",
                clientRequestId: "stale-client-request",
                idempotencyKey: "idem-story-2-2-stale",
                requestVersion: 1,
                draft: {
                  title: "늦게 도착한 AI 제목",
                  category: "카메라",
                  keySpecifications: ["stale"],
                  confidence: 0.91,
                  fallbackRecommended: false
                }
              },
              meta: {
                requestId: "req-story-2-2-stale"
              }
            });

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("제목").fill("사용자가 먼저 입력한 제목");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "first-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "second-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes-second")
    });

    await expect(page.getByLabel("제목").first()).toHaveValue(
      "사용자가 먼저 입력한 제목"
    );
    await expect(page.getByTestId("extraction-field-editor")).not.toContainText(
      "늦게 도착한 AI 제목"
    );
  });
});
