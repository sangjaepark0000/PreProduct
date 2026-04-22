import { expect, test } from "@playwright/test";

const listingId = "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b";
const rulePagePath = `/listings/${listingId}/auto-adjust-rule`;

const validRule = {
  periodDays: "14",
  discountRatePercent: "8",
  floorPriceKrw: "1200000"
};

const invalidRule = {
  periodDays: "0",
  discountRatePercent: "101",
  floorPriceKrw: "0"
};

async function fillRuleForm(
  page: import("@playwright/test").Page,
  values: typeof validRule
) {
  await page.getByLabel("주기(일)", { exact: true }).fill(values.periodDays);
  await page.getByLabel("인하율(%)", { exact: true }).fill(
    values.discountRatePercent
  );
  await page.getByLabel("최저가 하한 (원)", { exact: true }).fill(
    values.floorPriceKrw
  );
}

test.describe("Story 3.1 auto-adjust rule flow (ATDD RED)", () => {
  test.skip("[P0] saves a valid rule and marks it as the active rule", async ({ page }) => {
    await page.goto(rulePagePath);
    await fillRuleForm(page, validRule);
    await page.getByRole("button", { name: "규칙 저장" }).click();

    await expect(page.getByRole("alert")).toContainText("규칙이 저장되었습니다");
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "14일"
    );
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "8%"
    );
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "1,200,000원"
    );
    await expect(page.getByLabel("주기(일)", { exact: true })).toHaveValue("14");
    await expect(page.getByLabel("인하율(%)", { exact: true })).toHaveValue("8");
    await expect(page.getByLabel("최저가 하한 (원)", { exact: true })).toHaveValue(
      "1200000"
    );
  });

  test.skip(
    "[P0] keeps the last valid rule in place when an invalid update is submitted",
    async ({ page }) => {
      await page.goto(rulePagePath);
      await fillRuleForm(page, validRule);
      await page.getByRole("button", { name: "규칙 저장" }).click();

      await fillRuleForm(page, invalidRule);
      await page.getByRole("button", { name: "규칙 저장" }).click();

      await expect(page.getByRole("alert")).toContainText("유효성 검증");
      await expect(page.getByLabel("주기(일)", { exact: true })).toHaveValue("14");
      await expect(page.getByLabel("인하율(%)", { exact: true })).toHaveValue("8");
      await expect(page.getByLabel("최저가 하한 (원)", { exact: true })).toHaveValue(
        "1200000"
      );
      await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
        "14일"
      );
      await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
        "8%"
      );
    }
  );

  test.skip(
    "[P1] reloads the saved rule on revisit and preserves keyboard-safe focus order",
    async ({ page }) => {
      await page.goto(rulePagePath);
      await fillRuleForm(page, validRule);
      await page.getByRole("button", { name: "규칙 저장" }).click();

      await page.goto(`/listings/${listingId}`);
      await page.goto(rulePagePath);

      await expect(page.getByLabel("주기(일)", { exact: true })).toHaveValue("14");
      await expect(page.getByLabel("인하율(%)", { exact: true })).toHaveValue("8");
      await expect(page.getByLabel("최저가 하한 (원)", { exact: true })).toHaveValue(
        "1200000"
      );
      await expect(page.getByRole("status")).toContainText("현재 활성 규칙");

      await page.keyboard.press("Tab");
      await expect(page.getByLabel("주기(일)", { exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("인하율(%)", { exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("최저가 하한 (원)", { exact: true })).toBeFocused();
    }
  );
});
