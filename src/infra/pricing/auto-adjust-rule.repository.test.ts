import { Prisma } from "@prisma/client";

import { RetryableAutoAdjustRuleSaveError } from "@/domain/pricing/auto-adjust-rule";
import { createAutoAdjustRuleRepository } from "@/infra/pricing/auto-adjust-rule.repository";

const mockFindUnique = jest.fn();
const mockUpsert = jest.fn();

const mockPrismaClient = {
  autoAdjustRule: {
    findUnique: mockFindUnique,
    upsert: mockUpsert,
    deleteMany: jest.fn()
  }
};

describe("autoAdjustRule.repository", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpsert.mockReset();
  });

  it("upserts one active rule per listing and maps dates to domain strings", async () => {
    const repository = createAutoAdjustRuleRepository(mockPrismaClient);

    mockUpsert.mockResolvedValueOnce({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      periodDays: 14,
      discountRatePercent: 8,
      floorPriceKrw: 1_200_000,
      enabled: true,
      updatedAt: new Date("2026-04-22T00:00:00.000Z")
    });

    const rule = await repository.upsertActive({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      periodDays: 14,
      discountRatePercent: 8,
      floorPriceKrw: 1_200_000
    });

    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        listingId: "916df0fd-cc73-48cb-84e9-837c9748c968"
      },
      update: {
        periodDays: 14,
        discountRatePercent: 8,
        floorPriceKrw: 1_200_000,
        enabled: true
      },
      create: {
        listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
        periodDays: 14,
        discountRatePercent: 8,
        floorPriceKrw: 1_200_000,
        enabled: true
      }
    });
    expect(rule).toMatchObject({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      updatedAt: "2026-04-22T00:00:00.000Z"
    });
  });

  it("reads the active rule used to prefill the rule setup form", async () => {
    const repository = createAutoAdjustRuleRepository(mockPrismaClient);

    mockFindUnique.mockResolvedValueOnce({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      periodDays: 21,
      discountRatePercent: 5,
      floorPriceKrw: 1_100_000,
      enabled: true,
      updatedAt: new Date("2026-04-22T00:10:00.000Z")
    });

    await expect(
      repository.findActiveByListingId("916df0fd-cc73-48cb-84e9-837c9748c968")
    ).resolves.toMatchObject({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      periodDays: 21,
      discountRatePercent: 5,
      floorPriceKrw: 1_100_000,
      enabled: true,
      updatedAt: "2026-04-22T00:10:00.000Z"
    });
  });

  it("does not expose disabled rules as active prefill state", async () => {
    const repository = createAutoAdjustRuleRepository(mockPrismaClient);

    mockFindUnique.mockResolvedValueOnce({
      listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
      periodDays: 21,
      discountRatePercent: 5,
      floorPriceKrw: 1_100_000,
      enabled: false,
      updatedAt: new Date("2026-04-22T00:10:00.000Z")
    });

    await expect(
      repository.findActiveByListingId("916df0fd-cc73-48cb-84e9-837c9748c968")
    ).resolves.toBeNull();
  });

  it("returns null when the listing foreign key no longer exists", async () => {
    const repository = createAutoAdjustRuleRepository(mockPrismaClient);

    mockUpsert.mockRejectedValueOnce(
      Object.assign(Object.create(Prisma.PrismaClientKnownRequestError.prototype), {
        code: "P2003",
        message: "Foreign key constraint failed"
      })
    );

    await expect(
      repository.upsertActive({
        listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
        periodDays: 14,
        discountRatePercent: 8,
        floorPriceKrw: 1_200_000
      })
    ).resolves.toBeNull();
  });

  it("wraps retryable Prisma write failures for recoverable form UX", async () => {
    const repository = createAutoAdjustRuleRepository(mockPrismaClient);

    mockUpsert.mockRejectedValueOnce(
      Object.assign(Object.create(Prisma.PrismaClientUnknownRequestError.prototype), {
        message: "database offline"
      })
    );

    await expect(
      repository.upsertActive({
        listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
        periodDays: 14,
        discountRatePercent: 8,
        floorPriceKrw: 1_200_000
      })
    ).rejects.toBeInstanceOf(RetryableAutoAdjustRuleSaveError);
  });
});
