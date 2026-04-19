import { expect, test } from "../support/fixtures/index.js";
import { getListingById } from "../../src/domain/listing/listing.service";
import { getListingRepository } from "../../src/infra/listing/listing.repository";

test.describe("Listing registration", () => {
  test("creates a listing and opens the detail page", async ({ page }) => {
    const consoleMessages: string[] = [];
    const suffix = `${Date.now()}`;
    const title = `맥북 에어 M3 ${suffix}`;

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
    await page.getByRole("button", { name: "등록하고 상세 보기" }).click();

    await expect(page).toHaveURL(/\/listings\/[0-9a-f-]+$/u);
    await expect(page.getByTestId("listing-detail-title")).toHaveText(title);
    await expect(page.getByTestId("listing-detail-category")).toHaveText("노트북");
    await expect(page.getByTestId("listing-detail-price")).toHaveText("1,850,000원");
    await expect(page.getByTestId("listing-detail-specification")).toHaveCount(3);

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
      priceKrw: 1850000
    });

    await page.goto(`/listings/${listingId}`);
    await expect(page.getByTestId("listing-detail-specification")).toHaveText([
      "16GB RAM",
      "16GB RAM",
      "배터리 사이클 35회"
    ]);
    expect(
      consoleMessages.some((message) => message.includes("same key"))
    ).toBe(false);
  });
});
