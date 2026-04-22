import { expect, test } from "../support/fixtures/index.js";
import { getPrismaClient } from "@/infra/prisma/prisma.client";
import { randomUUID } from "node:crypto";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const olderAppliedAt = new Date("2026-04-22T02:00:00.000Z");
const newerAppliedAt = new Date("2026-04-23T02:00:00.000Z");

async function seedListing(listingId: string, priceKrw = 1_530_000) {
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
      priceKrw,
      initialStatus: "판매중",
      currentStatus: "판매중"
    }
  });
}

async function seedAppliedPriceChanges(listingId: string) {
  const prisma = getPrismaClient();

  await seedListing(listingId);

  await prisma.autoAdjustExecution.create({
    data: {
      listingId,
      runKey: "run-story-3-3-history-older",
      traceId: "trace-story-3-3-history-older",
      ruleRevision: "2026-04-08T02:00:00.000Z",
      status: "applied",
      reasonCode: "due-rule-applied",
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      evaluationAt: olderAppliedAt,
      appliedAt: olderAppliedAt,
      executedAt: olderAppliedAt
    }
  });
  await prisma.autoAdjustExecution.create({
    data: {
      listingId,
      runKey: "run-story-3-3-history-newer",
      traceId: "trace-story-3-3-history-newer",
      ruleRevision: "2026-04-08T02:00:00.000Z",
      status: "applied",
      reasonCode: "retry-recovered",
      beforePriceKrw: 1_702_000,
      afterPriceKrw: 1_530_000,
      evaluationAt: newerAppliedAt,
      appliedAt: newerAppliedAt,
      executedAt: newerAppliedAt
    }
  });
}

async function cleanupListing(listingId: string) {
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

  test("shows newest history first with before and after price, applied time, and reason", async ({
    page
  }) => {
    const listingId = randomUUID();

    try {
      await seedAppliedPriceChanges(listingId);

      await page.goto(`/listings/${listingId}/price-change-history`);

      await expect(page.getByTestId("price-change-history-page")).toBeVisible();
      await expect(page.getByRole("heading", { name: "가격 변경 이력" })).toBeVisible();
      const rows = page.getByTestId("price-change-history-row");

      await expect(rows).toHaveCount(2);
      await expect(rows.nth(0).getByTestId("price-change-history-before-price")).toContainText(
        "1,702,000"
      );
      await expect(rows.nth(0).getByTestId("price-change-history-after-price")).toContainText(
        "1,530,000"
      );
      await expect(rows.nth(0).getByTestId("price-change-history-applied-at")).toContainText(
        "2026-04-23"
      );
      await expect(rows.nth(0).getByTestId("price-change-history-reason")).toContainText(
        "retry-recovered"
      );
      await expect(rows.nth(1).getByTestId("price-change-history-before-price")).toContainText(
        "1,850,000"
      );
      await expect(rows.nth(1).getByTestId("price-change-history-after-price")).toContainText(
        "1,702,000"
      );
      await expect(rows.nth(1).getByTestId("price-change-history-applied-at")).toContainText(
        "2026-04-22"
      );
      await expect(rows.nth(1).getByTestId("price-change-history-reason")).toContainText(
        "due-rule-applied"
      );
    } finally {
      await cleanupListing(listingId);
    }
  });

  test("shows an empty state when a listing has no applied price changes", async ({
    page
  }) => {
    const listingId = randomUUID();

    try {
      await seedListing(listingId, 1_850_000);

      await page.goto(`/listings/${listingId}/price-change-history`);

      await expect(page.getByTestId("price-change-history-empty-state")).toBeVisible();
      await expect(page.getByTestId("price-change-history-empty-state")).toContainText(
        "아직 가격 변경 이력이 없습니다."
      );
      await expect(page.getByTestId("price-change-history-row")).toHaveCount(0);
    } finally {
      await cleanupListing(listingId);
    }
  });
});
