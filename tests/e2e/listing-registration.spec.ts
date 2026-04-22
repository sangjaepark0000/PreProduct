import { expect, test } from "../support/fixtures/index.js";
import { getListingById } from "../../src/domain/listing/listing.service";
import { getListingRepository } from "../../src/infra/listing/listing.repository";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

test.describe("Listing registration", () => {
  test.skip(
    !hasDatabaseUrl,
    "DATABASE_URL is required for DB-backed listing registration E2E tests."
  );

  test("surfaces required-field errors and recovers on the same screen", async ({
    page
  }) => {
    const title = "맥북 프로 14 e2e-validation-recovery";

    await page.goto("/listings/new");

    await page.getByLabel("카테고리").fill("노트북");
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    const errorAlert = page
      .getByRole("alert")
      .filter({ hasText: "입력 내용을 먼저 확인해 주세요." });

    await expect(page).toHaveURL(/\/listings\/new$/u);
    await expect(errorAlert).toContainText("입력이 필요한 항목이 있습니다.");
    await expect(errorAlert).toContainText("제목");
    await expect(errorAlert).toContainText("핵심 스펙");
    await expect(errorAlert).toContainText("가격");
    await expect(
      page.getByText("제목, 핵심 스펙, 가격을 수정한 뒤 다시 등록해 주세요.")
    ).toBeVisible();

    await page.getByLabel("제목").fill(title);
    await page.getByLabel("핵심 스펙").fill("M4 Pro\n24GB RAM");
    await page.getByLabel("가격 (원)").fill("2850000");
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
  });

  test("creates a listing and opens the detail page", async ({ page }) => {
    const consoleMessages: string[] = [];
    const title = "맥북 에어 M3 e2e-create-detail";

    page.on("console", (message) => {
      consoleMessages.push(message.text());
    });

    await page.goto("/listings/new");

    await page.getByLabel("제목").fill(title);
    await page.getByLabel("카테고리").fill("노트북");
    await page
      .getByLabel("핵심 스펙")
      .fill("16GB RAM\n16GB RAM\n배터리 사이클 35회");
    await page.getByLabel("가격 (원)").fill("1850000");
    await page.getByLabel("프리리스팅").check();
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
    await expect(page.getByTestId("listing-detail-status")).toHaveText("프리리스팅");
    await expect(page.getByTestId("listing-detail-category")).toHaveText("노트북");
    await expect(page.getByTestId("listing-detail-price")).toHaveText("1,850,000원");
    await expect(page.getByTestId("listing-detail-specification")).toHaveCount(3);
    const originalUpdatedAt = await page
      .getByTestId("listing-detail-updated-at")
      .textContent();

    const listingPathSegments = new URL(page.url()).pathname.split("/");
    const listingId = listingPathSegments.at(-1);

    expect(listingId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u
    );

    const storedListing = await getListingById(
      {
        listingRepository: getListingRepository()
      },
      listingId ?? ""
    );

    expect(storedListing).not.toBeNull();
    expect(storedListing).toMatchObject({
      id: listingId,
      title,
      category: "노트북",
      keySpecifications: ["16GB RAM", "16GB RAM", "배터리 사이클 35회"],
      priceKrw: 1850000,
      initialStatus: "프리리스팅",
      currentStatus: "프리리스팅"
    });

    await page.getByLabel("판매중").check();
    await page.getByRole("button", { name: "상태 저장" }).click();
    await expect(page.getByTestId("listing-detail-status")).toHaveText("판매중");
    await expect(page.getByTestId("listing-detail-updated-at")).not.toHaveText(
      originalUpdatedAt ?? ""
    );

    await page.goto(`/listings/${listingId}`);
    await expect(page.getByTestId("listing-detail-specification")).toHaveText([
      "16GB RAM",
      "16GB RAM",
      "배터리 사이클 35회"
    ]);
    await expect(page.getByTestId("listing-detail-status")).toHaveText("판매중");
    expect(
      consoleMessages.some((message) => message.includes("same key"))
    ).toBe(false);
  });
});
