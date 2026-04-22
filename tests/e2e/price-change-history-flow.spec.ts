import { expect, test } from "../support/fixtures/index.js";
import { getPrismaClient } from "@/infra/prisma/prisma.client";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const listingId = "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af";
const appliedAt = new Date("2026-04-22T02:00:00.000Z");

async function seedAppliedPriceChange() {
  const prisma = getPrismaClient();

  await prisma.autoAdjustExecution.deleteMany({
    where: {
      listingId
    }
  });
  await prisma.listing.deleteMany({
    where: {
      id: listingId
    }
  });
  await prisma.listing.create({
    data: {
      id: listingId,
      title: "ATDD 가격 변경 이력 매물",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 1_702_000,
      initialStatus: "판매중",
      currentStatus: "판매중"
    }
  });
  await prisma.autoAdjustExecution.create({
    data: {
      listingId,
      runKey: "run-story-3-3-history",
      traceId: "trace-story-3-3-history",
      ruleRevision: "2026-04-08T02:00:00.000Z",
      status: "applied",
      reasonCode: "due-rule-applied",
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      evaluationAt: appliedAt,
      appliedAt,
      executedAt: appliedAt
    }
  });
}

async function cleanupAppliedPriceChange() {
  const prisma = getPrismaClient();

  await prisma.autoAdjustExecution.deleteMany({
    where: {
      listingId
    }
  });
  await prisma.listing.deleteMany({
    where: {
      id: listingId
    }
  });
}

test.describe("Price change history flow", () => {
  test.skip(
    !hasDatabaseUrl,
    "DATABASE_URL is required for DB-backed price change history E2E tests."
  );

  test.beforeEach(async () => {
    await seedAppliedPriceChange();
  });

  test.afterEach(async () => {
    await cleanupAppliedPriceChange();
  });

  test("shows before and after price, applied time, and reason for an existing adjustment", async ({
    page
  }) => {
    await page.goto(`/listings/${listingId}/price-change-history`);

    await expect(page.getByTestId("price-change-history-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "가격 변경 이력" })).toBeVisible();
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
  });
});
