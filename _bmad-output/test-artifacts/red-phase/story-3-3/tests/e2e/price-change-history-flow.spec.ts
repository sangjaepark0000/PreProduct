import { expect, test } from "@playwright/test";

const listingId = "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af";
const historyPath = `/listings/${listingId}/price-change-history`;

test.describe("Story 3.3 price change history flow (ATDD RED)", () => {
  test.skip(
    "[P0] shows before/after price, applied time, and reason for an existing adjustment",
    async ({ page }) => {
      await page.goto(historyPath);

      await expect(page.getByTestId("price-change-history-page")).toBeVisible();
      await expect(page.getByTestId("price-change-history-row")).toHaveCount(1);
      await expect(page.getByTestId("price-change-history-before-price")).toContainText(
        "1,850,000"
      );
      await expect(page.getByTestId("price-change-history-after-price")).toContainText(
        "1,702,000"
      );
      await expect(page.getByTestId("price-change-history-applied-at")).toContainText(
        "2026-04-22"
      );
      await expect(page.getByTestId("price-change-history-reason")).toContainText(
        "due-rule-applied"
      );
    }
  );
});