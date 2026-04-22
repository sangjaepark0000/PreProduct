import { expect, test } from "@playwright/test";

import { createPricingConfirmationScenario } from "../support/factories/pricing-confirmation.factory";

async function fillConfirmedListingBasis(page: import("@playwright/test").Page) {
  const scenario = createPricingConfirmationScenario();
  const finalFields = page.getByTestId("listing-final-fields");

  await finalFields.getByLabel("제목", { exact: true }).fill(scenario.title);
  await finalFields.getByLabel("카테고리", { exact: true }).fill(scenario.category);
  await finalFields
    .getByLabel("핵심 스펙", { exact: true })
    .fill(scenario.keySpecificationsText);

  return scenario;
}

test.describe("Story 2.3 PriceSuggestionCard flow (ATDD RED)", () => {
  test.skip("[P0] accepts the suggested price and submits it as priceKrw", async ({
    page
  }) => {
    // Given: confirmed listing basis fields have produced a price suggestion.
    await page.goto("/listings/new");
    const scenario = await fillConfirmedListingBasis(page);
    const card = page.getByTestId("price-suggestion-card");

    await expect(card).toBeVisible();
    await expect(page.getByTestId("price-suggestion-amount")).toContainText(
      "1,240,000"
    );

    // When: the seller explicitly accepts the suggested price.
    await page.getByTestId("price-suggestion-accept-button").click();

    // Then: the final form value is the suggestion and an accepted event is prepared.
    await expect(page.getByLabel("가격 (원)")).toHaveValue(
      String(scenario.suggestedPriceKrw)
    );
    await expect(page.getByTestId("price-confirmed-event-id")).toContainText(
      /[0-9a-f-]{36}/u
    );
    await expect(page.getByTestId("price-confirmation-mode")).toHaveText(
      "accepted"
    );
  });

  test.skip("[P0] confirms a manually edited price and preserves the edited mode", async ({
    page
  }) => {
    // Given: the seller decides the recommendation needs manual adjustment.
    await page.goto("/listings/new");
    const scenario = await fillConfirmedListingBasis(page);

    // When: a valid manual price is entered and confirmed.
    await page.getByLabel("수동 가격 (원)").fill(String(scenario.editedPriceKrw));
    await page.getByLabel("수정 사유").fill(scenario.manualReason);
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    // Then: the submitted priceKrw is the edited value and event mode is edited.
    await expect(page.getByLabel("가격 (원)")).toHaveValue(
      String(scenario.editedPriceKrw)
    );
    await expect(page.getByTestId("price-confirmation-mode")).toHaveText("edited");
    await expect(page.getByTestId("price-confirmed-event-id")).toContainText(
      /[0-9a-f-]{36}/u
    );
  });

  test.skip("[P0] blocks invalid manual price confirmation with recovery guidance", async ({
    page
  }) => {
    // Given: the seller is using manual price confirmation.
    await page.goto("/listings/new");
    const scenario = await fillConfirmedListingBasis(page);

    // When: the price violates the MVP max policy.
    await page.getByLabel("수동 가격 (원)").fill(String(scenario.maxPriceKrw + 1));
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    // Then: confirmation and event creation are blocked with field-level recovery.
    await expect(page.getByRole("alert")).toContainText("가격 범위를 확인해 주세요");
    await expect(page.getByText("1원 이상, 1,000원 단위")).toBeVisible();
    await expect(page.getByLabel("수동 가격 (원)")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });

  test.skip("[P1] offers auth recovery without losing seller input or creating an event", async ({
    page
  }) => {
    // Given: the price confirmation branch receives an auth-required failure.
    await page.addInitScript(() => {
      window.localStorage.setItem("pricing-confirmation-error", "AUTH_REQUIRED");
    });
    await page.goto("/listings/new");
    const scenario = await fillConfirmedListingBasis(page);
    await page.getByLabel("수동 가격 (원)").fill(String(scenario.editedPriceKrw));

    // When: the seller attempts to confirm price.
    await page.getByRole("button", { name: "수동 가격 확정" }).click();

    // Then: re-auth/retry guidance is shown and the current input remains intact.
    await expect(page.getByRole("alert")).toContainText("다시 인증해 주세요");
    await expect(page.getByRole("button", { name: "재인증 후 계속" })).toBeVisible();
    await expect(page.getByLabel("수동 가격 (원)")).toHaveValue(
      String(scenario.editedPriceKrw)
    );
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });

  test.skip("[P0] blocks accepting a stale suggestion after listing basis changes", async ({
    page
  }) => {
    // Given: a suggestion was calculated for the original title/category/spec revision.
    await page.goto("/listings/new");
    await fillConfirmedListingBasis(page);
    await expect(page.getByTestId("price-suggestion-card")).toBeVisible();

    // When: the seller changes a core listing field after suggestion generation.
    await page
      .getByTestId("listing-final-fields")
      .getByLabel("핵심 스펙", { exact: true })
      .fill("M3 Pro\n18GB RAM\n외관 흠집 있음");
    await page.getByTestId("price-suggestion-accept-button").click();

    // Then: the stale revision is detected and re-confirmation is required.
    await expect(page.getByTestId("price-suggestion-stale-alert")).toContainText(
      "상품 정보가 수정되어 추천가가 오래되었습니다"
    );
    await expect(
      page.getByRole("button", { name: "현재 정보 기준으로 다시 확인" })
    ).toBeVisible();
    await expect(page.getByTestId("price-confirmed-event-id")).toHaveCount(0);
  });
});
