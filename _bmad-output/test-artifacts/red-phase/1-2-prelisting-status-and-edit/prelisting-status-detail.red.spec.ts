import { expect, test } from "@playwright/test";

test.describe("Story 1.2 red-phase prelisting status flow", () => {
  test("creates a listing with 프리리스팅 and edits it to 판매중 from the detail page", async ({
    page
  }) => {
    const suffix = `${Date.now()}`;

    await page.goto("/listings/new");

    await page.getByLabel("제목").fill(`아이폰 16 프로 ${suffix}`);
    await page.getByLabel("카테고리").fill("스마트폰");
    await page.getByLabel("핵심 스펙").fill("256GB\n배터리 효율 99%");
    await page.getByLabel("가격 (원)").fill("1450000");
    await page.getByLabel("프리리스팅").check();
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page.getByTestId("listing-detail-status")).toHaveText(
      "프리리스팅"
    );

    const originalUpdatedAt = await page
      .getByTestId("listing-detail-updated-at")
      .textContent();

    await page.getByLabel("판매중").check();
    await page.getByRole("button", { name: "상태 저장" }).click();

    await expect(page.getByTestId("listing-detail-status")).toHaveText("판매중");
    await expect(page.getByTestId("listing-detail-updated-at")).not.toHaveText(
      originalUpdatedAt ?? ""
    );
  });
});
