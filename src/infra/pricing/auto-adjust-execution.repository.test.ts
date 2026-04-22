jest.mock("@/infra/prisma/prisma.client", () => ({
  getPrismaClient: jest.fn()
}));

import { createAutoAdjustExecutionRepository } from "@/infra/pricing/auto-adjust-execution.repository";

const mockCreateExecution = jest.fn();
const mockFindUniqueExecution = jest.fn();
const mockUpdateExecution = jest.fn();
const mockFindUniqueListing = jest.fn();
const mockUpdateListing = jest.fn();

const transaction = {
  autoAdjustExecution: {
    create: mockCreateExecution,
    findUnique: mockFindUniqueExecution,
    update: mockUpdateExecution,
    deleteMany: jest.fn()
  },
  listing: {
    findUnique: mockFindUniqueListing,
    update: mockUpdateListing
  }
};

const prismaClient = {
  ...transaction,
  $transaction: jest.fn(async (callback) => callback(transaction))
};

const input = {
  listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
  runKey: "run-20260422-001",
  traceId: "trace-auto-adjust-20260422",
  requestedAt: "2026-04-22T02:00:00.000Z",
  ruleRevision: "2026-04-22T00:00:00.000Z",
  currentPriceKrw: 1_850_000
};

const listingWithRule = {
  id: input.listingId,
  priceKrw: 1_850_000,
  autoAdjustRule: {
    listingId: input.listingId,
    periodDays: 14,
    discountRatePercent: 8,
    floorPriceKrw: 1_200_000,
    enabled: true,
    updatedAt: new Date("2026-04-22T00:00:00.000Z")
  }
};

describe("auto-adjust execution repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateExecution.mockResolvedValue({
      id: "execution-id",
      listingId: input.listingId,
      runKey: input.runKey,
      traceId: input.traceId,
      ruleRevision: input.ruleRevision,
      status: "in-progress",
      reasonCode: null,
      skipReason: null,
      beforePriceKrw: null,
      afterPriceKrw: null,
      eventId: null,
      event: null,
      evaluationAt: new Date(input.requestedAt),
      appliedAt: null,
      executedAt: new Date(input.requestedAt),
      duplicateCount: 0,
      createdAt: new Date(input.requestedAt),
      updatedAt: new Date(input.requestedAt)
    });
    mockFindUniqueListing.mockResolvedValue(listingWithRule);
    mockUpdateExecution.mockResolvedValue({});
    mockUpdateListing.mockResolvedValue({});
  });

  it("claims a run key, applies a due rule, stores the event, and mutates listing price once", async () => {
    const repository = createAutoAdjustExecutionRepository(prismaClient);

    await expect(repository.executeRun(input)).resolves.toMatchObject({
      status: "applied",
      reasonCode: "due-rule-applied",
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      eventId: expect.stringMatching(/[0-9a-f-]{36}/u)
    });
    expect(mockUpdateListing).toHaveBeenCalledWith({
      where: {
        id: input.listingId
      },
      data: {
        priceKrw: 1_702_000
      }
    });
    expect(mockUpdateExecution).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "applied",
          reasonCode: "due-rule-applied",
          eventId: expect.stringMatching(/[0-9a-f-]{36}/u)
        })
      })
    );
  });

  it("records duplicate attempts without applying another listing price update", async () => {
    mockCreateExecution.mockRejectedValueOnce(
      Object.assign(new Error("Unique constraint failed"), {
        code: "P2002"
      })
    );
    mockFindUniqueExecution.mockResolvedValueOnce({
      id: "execution-id",
      listingId: input.listingId,
      runKey: input.runKey,
      traceId: input.traceId,
      ruleRevision: input.ruleRevision,
      status: "applied",
      reasonCode: "due-rule-applied",
      skipReason: null,
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      eventId: "fdd23504-9420-5d9b-8f56-9dd000f54344",
      event: {},
      evaluationAt: new Date(input.requestedAt),
      appliedAt: new Date(input.requestedAt),
      executedAt: new Date(input.requestedAt),
      duplicateCount: 0,
      createdAt: new Date(input.requestedAt),
      updatedAt: new Date(input.requestedAt)
    });
    const repository = createAutoAdjustExecutionRepository(prismaClient);

    await expect(repository.executeRun(input)).resolves.toMatchObject({
      status: "duplicate",
      duplicateOfRunKey: input.runKey
    });
    expect(mockUpdateListing).not.toHaveBeenCalled();
    expect(mockUpdateExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          duplicateCount: {
            increment: 1
          }
        }
      })
    );
  });

  it("persists a floor-violation skip without mutating listing price or emitting an event", async () => {
    mockFindUniqueListing.mockResolvedValueOnce({
      ...listingWithRule,
      priceKrw: 1_250_000
    });
    const repository = createAutoAdjustExecutionRepository(prismaClient);

    await expect(repository.executeRun(input)).resolves.toMatchObject({
      status: "skipped",
      skipReason: "floor-violation"
    });
    expect(mockUpdateListing).not.toHaveBeenCalled();
    expect(mockUpdateExecution).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "skipped",
          skipReason: "floor-violation",
          eventId: null
        })
      })
    );
  });

  it("recovers a partial-failure run key into a single applied result", async () => {
    mockCreateExecution.mockRejectedValueOnce(
      Object.assign(new Error("Unique constraint failed"), {
        code: "P2002"
      })
    );
    mockFindUniqueExecution.mockResolvedValueOnce({
      id: "execution-id",
      listingId: input.listingId,
      runKey: input.runKey,
      traceId: input.traceId,
      ruleRevision: input.ruleRevision,
      status: "partial-failure",
      reasonCode: null,
      skipReason: null,
      beforePriceKrw: 1_850_000,
      afterPriceKrw: null,
      eventId: null,
      event: null,
      evaluationAt: new Date(input.requestedAt),
      appliedAt: new Date("2026-04-22T01:59:59.000Z"),
      executedAt: new Date(input.requestedAt),
      duplicateCount: 0,
      createdAt: new Date(input.requestedAt),
      updatedAt: new Date(input.requestedAt)
    });
    const repository = createAutoAdjustExecutionRepository(prismaClient);

    await expect(repository.executeRun(input)).resolves.toMatchObject({
      status: "applied",
      reasonCode: "retry-recovered",
      applyCount: 1
    });
    expect(mockUpdateListing).toHaveBeenCalledTimes(1);
  });
});
