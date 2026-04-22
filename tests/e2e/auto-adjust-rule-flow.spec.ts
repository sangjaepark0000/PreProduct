import { expect, test } from "../support/fixtures/index.js";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function confirmManualPrice(
  page: import("@playwright/test").Page,
  priceKrw: string
) {
  await page.getByLabel("수동 가격 (원)").fill(priceKrw);
  await page.getByRole("button", { name: "수동 가격 확정" }).click();
}

async function createListingForRule(
  page: import("@playwright/test").Page,
  title: string
): Promise<string> {
  await page.goto("/listings/new");

  await page.getByLabel("제목").fill(title);
  await page.getByLabel("카테고리").fill("노트북");
  await page.getByLabel("핵심 스펙").fill("M4 Pro\n24GB RAM");
  await confirmManualPrice(page, "1850000");
  await page.getByRole("button", { name: "등록하고 상세 보기" }).click();
  await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);

  const listingId = new URL(page.url()).pathname.split("/").at(-1);

  if (!listingId) {
    throw new Error("Expected listing detail URL to include a listing id.");
  }

  return listingId;
}

async function fillRuleForm(
  page: import("@playwright/test").Page,
  values: {
    periodDays: string;
    discountRatePercent: string;
    floorPriceKrw: string;
  }
) {
  await page.getByLabel("주기(일)", { exact: true }).fill(values.periodDays);
  await page
    .getByLabel("인하율(%)", { exact: true })
    .fill(values.discountRatePercent);
  await page
    .getByLabel("최저가 하한 (원)", { exact: true })
    .fill(values.floorPriceKrw);
}

test.describe("Auto-adjust rule flow", () => {
  test.skip(
    !hasDatabaseUrl,
    "DATABASE_URL is required for DB-backed auto-adjust rule E2E tests."
  );

  test("saves, preserves, and reloads an active auto-adjust rule", async ({
    page
  }) => {
    const listingId = await createListingForRule(
      page,
      "맥북 프로 14 auto-adjust-rule-flow"
    );
    const rulePagePath = `/listings/${listingId}/auto-adjust-rule`;

    await page.getByRole("link", { name: "자동 가격조정 설정" }).click();
    await expect(page).toHaveURL(rulePagePath);

    await fillRuleForm(page, {
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });
    await page.getByRole("button", { name: "규칙 저장" }).click();

    await expect(page.getByRole("status")).toContainText("규칙이 저장되었습니다");
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "14일"
    );
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "8%"
    );
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "1,200,000원"
    );

    await fillRuleForm(page, {
      periodDays: "0",
      discountRatePercent: "101",
      floorPriceKrw: "0"
    });
    await page.getByRole("button", { name: "규칙 저장" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "유효성 검증" })
    ).toContainText("유효성 검증");
    await expect(page.getByLabel("주기(일)", { exact: true })).toHaveValue("14");
    await expect(page.getByLabel("인하율(%)", { exact: true })).toHaveValue("8");
    await expect(page.getByLabel("최저가 하한 (원)", { exact: true })).toHaveValue(
      "1200000"
    );
    await expect(page.getByTestId("auto-adjust-rule-active-summary")).toContainText(
      "14일"
    );

    await page.goto(`/listings/${listingId}`);
    await expect(page.getByTestId("listing-detail-auto-adjust-rule")).toContainText(
      "14일마다 8% 인하"
    );
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
  });
});
