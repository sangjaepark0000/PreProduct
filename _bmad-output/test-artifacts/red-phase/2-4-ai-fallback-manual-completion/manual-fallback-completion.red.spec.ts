import { expect, test } from "../../../../tests/support/fixtures/index.js";
import type { Page } from "@playwright/test";

type AiRequestMeta = {
  clientRequestId: string;
  idempotencyKey: string;
  requestVersion: number;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function createDeferred<T = void>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function readMultipartField(body: string, fieldName: string): string {
  const match = body.match(
    new RegExp(`name="${fieldName}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`)
  );

  if (!match?.[1]) {
    throw new Error(`Missing multipart field: ${fieldName}`);
  }

  return match[1];
}

function readAiRequestMeta(body: string): AiRequestMeta {
  return {
    clientRequestId: readMultipartField(body, "clientRequestId"),
    idempotencyKey: readMultipartField(body, "idempotencyKey"),
    requestVersion: Number(readMultipartField(body, "requestVersion"))
  };
}

function buildAiTimeoutErrorBody(requestId: string): string {
  return JSON.stringify({
    error: {
      code: "AI_TIMEOUT",
      message: "AI 초안 생성 시간이 초과되었습니다.",
      requestId,
      details: {
        recoveryGuide: "수동 입력으로 계속 진행할 수 있습니다.",
        retryable: true
      }
    }
  });
}

function buildLowConfidenceSuccessBody(meta: AiRequestMeta, requestId: string): string {
  return JSON.stringify({
    data: {
      status: "success",
      clientRequestId: meta.clientRequestId,
      idempotencyKey: meta.idempotencyKey,
      requestVersion: meta.requestVersion,
      draft: {
        title: "신뢰 낮은 AI 제목",
        category: "노트북",
        keySpecifications: ["AI 추정 스펙"],
        confidence: 0.31,
        fallbackRecommended: true
      }
    },
    meta: {
      requestId
    }
  });
}

async function uploadProductPhoto(page: Page) {
  await page.getByLabel("상품 사진 업로드").setInputFiles({
    name: "manual-fallback-product.jpg",
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

test.describe("Story 2.4 red-phase manual fallback completion", () => {
  test.skip("[P0] completes registration after one-tap fallback from AI timeout", async ({
    page
  }) => {
    const suffix = `${Date.now()}`;
    const title = `수동 fallback 카메라 ${suffix}`;

    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: buildAiTimeoutErrorBody("req-story-2-4-timeout")
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);
    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();

    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
    await expect(page.getByLabel("제목")).toBeEditable();
    await expect(page.getByLabel("카테고리")).toBeEditable();
    await expect(page.getByLabel("핵심 스펙")).toBeEditable();
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

  test.skip("[P0] exposes low-confidence AI draft as a manual fallback choice without auto-confirming it", async ({
    page
  }) => {
    const suffix = `${Date.now()}`;
    const title = `저신뢰 fallback 수동 입력 ${suffix}`;

    await page.route("**/api/ai/extractions", async (route) => {
      const meta = readAiRequestMeta(route.request().postData() ?? "");

      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: buildLowConfidenceSuccessBody(meta, "req-story-2-4-low-confidence")
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

  test.skip("[P0] preserves manual title, specs, price, and status when a late AI success arrives after fallback", async ({
    page
  }) => {
    const lateResponse = createDeferred();
    const title = `late-success-preserved-${Date.now()}`;

    await page.route("**/api/ai/extractions", async (route) => {
      await lateResponse.promise;
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "success",
            clientRequestId: "stale-client-request",
            idempotencyKey: "idem-story-2-4-late-success",
            requestVersion: 1,
            draft: {
              title: "AI가 늦게 덮어쓰려는 제목",
              category: "노트북",
              keySpecifications: ["AI late spec"],
              confidence: 0.9,
              fallbackRecommended: false
            }
          },
          meta: {
            requestId: "req-story-2-4-late-success"
          }
        })
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);
    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();
    await fillManualListingFields(page, title);

    lateResponse.resolve();

    await expect(page.getByLabel("제목")).toHaveValue(title);
    await expect(page.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(page.getByLabel("핵심 스펙")).toHaveValue("바디 단품\n셔터 1200컷");
    await expect(page.getByLabel("가격 (원)")).toHaveValue("880000");
    await expect(page.getByLabel("판매중")).toBeChecked();
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
  });

  test.skip("[P0] preserves manual values and fallback state when a late AI error arrives after fallback", async ({
    page
  }) => {
    const lateError = createDeferred();
    const title = `late-error-preserved-${Date.now()}`;

    await page.route("**/api/ai/extractions", async (route) => {
      await lateError.promise;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "AI_UNAVAILABLE",
            message: "AI 서비스를 사용할 수 없습니다.",
            requestId: "req-story-2-4-late-error",
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
    await expect(page.getByLabel("가격 (원)")).toHaveValue("880000");
    await expect(page.getByLabel("판매중")).toBeChecked();
    await expect(page.getByTestId("photo-uploader-request-state")).toHaveText(
      "fallback"
    );
  });

  test.skip("[P1] keeps fallback inputs on required-field validation errors and allows same-screen retry", async ({
    page
  }) => {
    const title = `fallback-validation-retry-${Date.now()}`;

    await page.route("**/api/ai/extractions", async (route) => {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: buildAiTimeoutErrorBody("req-story-2-4-validation")
      });
    });

    await page.goto("/listings/new");
    await uploadProductPhoto(page);
    await page.getByRole("button", { name: "수동 입력으로 계속" }).click();

    await page.getByLabel("제목").fill(title);
    await page.getByLabel("카테고리").fill("카메라");
    await page.getByLabel("판매중").check();
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/new$/u);
    await expect(
      page.getByRole("alert").filter({ hasText: "입력 내용을 먼저 확인해 주세요." })
    ).toContainText("핵심 스펙");
    await expect(
      page.getByRole("alert").filter({ hasText: "입력 내용을 먼저 확인해 주세요." })
    ).toContainText("가격");
    await expect(page.getByLabel("제목")).toHaveValue(title);
    await expect(page.getByLabel("카테고리")).toHaveValue("카메라");
    await expect(page.getByLabel("판매중")).toBeChecked();

    await page.getByLabel("핵심 스펙").fill("바디 단품");
    await page.getByLabel("가격 (원)").fill("880000");
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
  });
});
