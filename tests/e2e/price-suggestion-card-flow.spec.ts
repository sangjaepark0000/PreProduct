import { expect, test } from "../support/fixtures/index.js";
import {
  buildPricingSuggestion,
  buildPricingSuggestionBasis
} from "@/domain/pricing/pricing-suggestion";
import { buildPricingSuggestionAcceptedV1 } from "@/shared/contracts/events/pricing-suggestion-accepted.v1";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function fillConfirmedListingBasis(
  page: import("@playwright/test").Page,
  title = "ATDD 맥북 프로 M3"
) {
  const finalFields = page.getByTestId("listing-final-fields");

  await finalFields.getByLabel("제목", { exact: true }).fill(title);
  await finalFields.getByLabel("카테고리", { exact: true }).fill("노트북");
  await finalFields
    .getByLabel("핵심 스펙", { exact: true })
    .fill("M3 Pro\n18GB RAM\n512GB SSD");
}

test.describe("PriceSuggestionCard flow", () => {
  test("submits the accepted suggested price as the final listing price", async ({
    page
  }) => {
    test.skip(
      !hasDatabaseUrl,
      "DATABASE_URL is required for DB-backed price submission E2E tests."
    );

    const title = "ATDD 맥북 프로 M3 price-suggestion-submit";

    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page, title);
    await page.getByTestId("price-suggestion-accept-button").click();
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
    await expect(page.getByTestId("listing-detail-price")).toHaveText(
      "1,240,000원"
    );
  });

  test("accepts the suggested price and prepares an accepted event", async ({
    page
  }) => {
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);

    await expect(page.getByTestId("price-suggestion-card")).toBeVisible();
    await expect(page.getByTestId("price-suggestion-amount")).toContainText(
      "1,240,000"
    );

    await page.getByTestId("price-suggestion-accept-button").click();

    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue(
      "1240000"
    );
    await expect(page.getByTestId("price-confirmed-event-id")).toContainText(
      /[0-9a-f-]{36}/u
    );
    await expect(page.getByTestId("price-confirmation-mode")).toHaveText(
      "accepted"
    );
  });

  test("confirms a manually edited price and preserves edited mode", async ({
    page
  }) => {
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);

    await page.getByLabel("수동 가격 (원)").fill("1180000");
    await page.getByLabel("수정 사유").fill("구성품 누락을 반영한 수동 수정");
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue(
      "1180000"
    );
    await expect(page.getByTestId("price-confirmation-mode")).toHaveText("edited");
    await expect(page.getByTestId("price-confirmed-event-id")).toContainText(
      /[0-9a-f-]{36}/u
    );
  });

  test("blocks invalid manual price confirmation with recovery guidance", async ({
    page
  }) => {
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await page.getByTestId("price-suggestion-accept-button").click();

    await page.getByLabel("수동 가격 (원)").fill("100000000");
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    await expect(
      page.getByTestId("price-suggestion-card").getByRole("alert")
    ).toContainText("가격 범위를 확인해 주세요");
    await expect(
      page
        .getByTestId("price-suggestion-card")
        .getByRole("alert")
        .getByText("1원 이상, 1,000원 단위")
    ).toBeVisible();
    await expect(page.getByLabel("수동 가격 (원)")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue("");
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });

  test("offers auth recovery without losing seller input or creating an event", async ({
    page
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("pricing-confirmation-error", "AUTH_REQUIRED");
    });
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await page.getByLabel("수동 가격 (원)").fill("1180000");

    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    await expect(
      page.getByTestId("price-suggestion-card").getByRole("alert")
    ).toContainText("다시 인증해 주세요");
    await expect(page.getByRole("button", { name: "재인증 후 계속" })).toBeVisible();
    await expect(page.getByLabel("수동 가격 (원)")).toHaveValue("1180000");
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });

  test("blocks accepting a stale suggestion after listing basis changes", async ({
    page
  }) => {
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await expect(page.getByTestId("price-suggestion-card")).toBeVisible();

    await page
      .getByTestId("listing-final-fields")
      .getByLabel("핵심 스펙", { exact: true })
      .fill("M3 Pro\n18GB RAM\n외관 흠집 있음");
    await page.getByTestId("price-suggestion-accept-button").click();

    await expect(page.getByTestId("price-suggestion-stale-alert")).toContainText(
      "상품 정보가 수정되어 추천가가 오래되었습니다"
    );
    await expect(
      page.getByRole("button", { name: "현재 정보 기준으로 다시 확인" })
    ).toBeVisible();
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });

  test("invalidates a confirmed price when the listing basis changes", async ({
    page
  }) => {
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await page.getByTestId("price-suggestion-accept-button").click();

    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue(
      "1240000"
    );

    await page
      .getByTestId("listing-final-fields")
      .getByLabel("핵심 스펙", { exact: true })
      .fill("M3 Pro\n18GB RAM\n외관 흠집 있음");

    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue("");
    await expect(
      page.getByTestId("price-suggestion-card").getByRole("status")
    ).toContainText("상품 정보가 수정되어 가격을 다시 확정해 주세요.");

    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    const errorAlert = page
      .getByRole("alert")
      .filter({ hasText: "입력 내용을 먼저 확인해 주세요." });

    await expect(page).toHaveURL(/\/listings\/new$/u);
    await expect(errorAlert).toContainText("가격");
  });

  test("uses the current basis revision for manual confirmation after a stale suggestion", async ({
    page
  }) => {
    const changedSpecs = "M3 Pro\n18GB RAM\n외관 흠집 있음";
    const currentBasis = buildPricingSuggestionBasis({
      title: "ATDD 맥북 프로 M3",
      category: "노트북",
      keySpecificationsText: changedSpecs
    });
    const currentSuggestion = buildPricingSuggestion(currentBasis);

    if (!currentSuggestion) {
      throw new Error("Expected current basis to produce a pricing suggestion.");
    }

    const expectedEvent = buildPricingSuggestionAcceptedV1({
      clientRequestId: `client-${currentBasis.basisRevision}`,
      idempotencyKey: `pricing-${currentBasis.basisRevision}`,
      traceId: `trace-${currentBasis.basisRevision}`,
      basisRevision: currentBasis.basisRevision,
      suggestedPriceKrw: currentSuggestion.suggestedPriceKrw,
      confirmedPriceKrw: 1_180_000,
      mode: "edited",
      manualReason: "상태 하자를 반영한 수동 수정"
    });

    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await expect(page.getByTestId("price-suggestion-card")).toBeVisible();

    await page
      .getByTestId("listing-final-fields")
      .getByLabel("핵심 스펙", { exact: true })
      .fill(changedSpecs);
    await page.getByLabel("수동 가격 (원)").fill("1180000");
    await page.getByLabel("수정 사유").fill("상태 하자를 반영한 수동 수정");
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    await expect(page.getByLabel("가격 (원)", { exact: true })).toHaveValue(
      "1180000"
    );
    await expect(page.getByTestId("price-confirmation-mode")).toHaveText("edited");
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveText(
      expectedEvent.eventId
    );
  });
});
