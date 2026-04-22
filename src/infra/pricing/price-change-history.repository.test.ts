jest.mock("@/infra/prisma/prisma.client", () => ({
  getPrismaClient: jest.fn()
}));

import { createPriceChangeHistoryRepository } from "@/infra/pricing/price-change-history.repository";

const mockFindManyExecution = jest.fn();

const prismaClient = {
  autoAdjustExecution: {
    findMany: mockFindManyExecution
  }
};

const listingId = "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af";

describe("price change history repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads applied execution records as seller-facing history rows", async () => {
    mockFindManyExecution.mockResolvedValueOnce([
      {
        listingId,
        reasonCode: "retry-recovered",
        beforePriceKrw: 1_702_000,
        afterPriceKrw: 1_530_000,
        appliedAt: new Date("2026-04-23T02:00:00.000Z")
      },
      {
        listingId,
        reasonCode: "due-rule-applied",
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: new Date("2026-04-22T02:00:00.000Z")
      }
    ]);
    const repository = createPriceChangeHistoryRepository(prismaClient);

    await expect(repository.listForListing(listingId)).resolves.toEqual([
      {
        listingId,
        beforePriceKrw: 1_702_000,
        afterPriceKrw: 1_530_000,
        appliedAt: "2026-04-23T02:00:00.000Z",
        reasonCode: "retry-recovered"
      },
      {
        listingId,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: "2026-04-22T02:00:00.000Z",
        reasonCode: "due-rule-applied"
      }
    ]);
    expect(mockFindManyExecution).toHaveBeenCalledWith({
      where: {
        listingId,
        status: "applied",
        appliedAt: {
          not: null
        }
      },
      orderBy: [
        {
          appliedAt: "desc"
        },
        {
          createdAt: "desc"
        },
        {
          id: "desc"
        }
      ],
      select: {
        listingId: true,
        reasonCode: true,
        beforePriceKrw: true,
        afterPriceKrw: true,
        appliedAt: true
      }
    });
  });

  it("derives minimal signals from the same applied execution records", async () => {
    mockFindManyExecution.mockResolvedValueOnce([
      {
        listingId,
        reasonCode: "retry-recovered",
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: new Date("2026-04-22T02:00:00.000Z")
      }
    ]);
    const repository = createPriceChangeHistoryRepository(prismaClient);

    await expect(repository.listMinimalSignalsForListing(listingId)).resolves.toEqual([
      {
        listingId,
        updatedAt: "2026-04-22T02:00:00.000Z",
        reasonCode: "retry-recovered"
      }
    ]);
  });

  it("does not project incomplete applied records into history or signals", async () => {
    mockFindManyExecution.mockResolvedValue([
      {
        listingId,
        reasonCode: null,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: new Date("2026-04-22T02:00:00.000Z")
      }
    ]);
    const repository = createPriceChangeHistoryRepository(prismaClient);

    await expect(repository.listForListing(listingId)).resolves.toEqual([]);
    await expect(repository.listMinimalSignalsForListing(listingId)).resolves.toEqual(
      []
    );
  });
});
