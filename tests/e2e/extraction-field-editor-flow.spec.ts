import { expect, test } from "../support/fixtures/index.js";
import {
  buildAiSuccessBody,
  readAiRequestMeta
} from "../support/helpers/ai-extraction.js";

test.describe("ExtractionFieldEditor flow", () => {
  test("shows the AI draft in the review editor without auto-filling final fields", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-story-2-2-editor")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    const editor = page.getByTestId("extraction-field-editor");
    const finalFields = page.getByTestId("listing-final-fields");

    await expect(editor).toBeVisible();
    await expect(page.getByTestId("extraction-confidence-label")).toContainText(
      "높음 82%"
    );
    await expect(editor.getByLabel("AI 초안 제목")).toHaveValue("AI가 만든 제목");
    await expect(finalFields.getByLabel("제목", { exact: true })).toHaveValue("");
    await expect(finalFields.getByLabel("카테고리", { exact: true })).toHaveValue(
      ""
    );
    await expect(finalFields.getByLabel("핵심 스펙", { exact: true })).toHaveValue(
      ""
    );
  });

  test("applies edited draft values to the final listing form only after confirmation", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-story-2-2-confirm")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    const editor = page.getByTestId("extraction-field-editor");
    const finalFields = page.getByTestId("listing-final-fields");

    await editor.getByLabel("AI 초안 제목").fill("사용자가 확정한 제목");
    await editor.getByLabel("AI 초안 카테고리").fill("랩톱");
    await editor.getByLabel("AI 초안 핵심 스펙").fill("M3 Pro\n18GB RAM");
    await page.getByTestId("extraction-confirm-button").click();

    await expect(finalFields.getByLabel("제목", { exact: true })).toHaveValue(
      "사용자가 확정한 제목"
    );
    await expect(finalFields.getByLabel("카테고리", { exact: true })).toHaveValue(
      "랩톱"
    );
    await expect(finalFields.getByLabel("핵심 스펙", { exact: true })).toHaveValue(
      "M3 Pro\n18GB RAM"
    );
    await expect(page.getByTestId("extraction-review-status")).toContainText(
      "AI 초안을 확정했습니다"
    );
  });

  test("blocks confirmation with field-level errors when review fields are empty", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-story-2-2-validation")
      });
    });

    await page.goto("/listings/new");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "macbook-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    const editor = page.getByTestId("extraction-field-editor");
    const finalFields = page.getByTestId("listing-final-fields");

    await editor.getByLabel("AI 초안 제목").fill("");
    await editor.getByLabel("AI 초안 카테고리").fill("");
    await editor.getByLabel("AI 초안 핵심 스펙").fill("");
    await page.getByTestId("extraction-confirm-button").click();

    await expect(editor.getByRole("alert")).toContainText("제목");
    await expect(editor.getByRole("alert")).toContainText("카테고리");
    await expect(editor.getByRole("alert")).toContainText("핵심 스펙");
    await expect(finalFields.getByLabel("제목", { exact: true })).toHaveValue("");
    await expect(finalFields.getByLabel("카테고리", { exact: true })).toHaveValue(
      ""
    );
    await expect(finalFields.getByLabel("핵심 스펙", { exact: true })).toHaveValue(
      ""
    );
  });

  test("preserves manual final fields while new AI drafts stay in review", async ({
    page
  }) => {
    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildAiSuccessBody(meta, "req-story-2-2-manual-preserve")
      });
    });

    await page.goto("/listings/new");

    const finalFields = page.getByTestId("listing-final-fields");

    await finalFields
      .getByLabel("제목", { exact: true })
      .fill("사용자가 먼저 입력한 제목");
    await page.getByLabel("상품 사진 업로드").setInputFiles({
      name: "first-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg-bytes")
    });

    await expect(finalFields.getByLabel("제목", { exact: true })).toHaveValue(
      "사용자가 먼저 입력한 제목"
    );
    await expect(page.getByTestId("extraction-field-editor")).toBeVisible();
  });
});
