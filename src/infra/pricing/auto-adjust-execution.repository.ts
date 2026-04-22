import {
  evaluateAutoAdjustExecution,
  type AutoAdjustExecutionResult,
  type AutoAdjustPreviousAttempt
} from "@/domain/pricing/auto-adjust-execution";
import { autoAdjustRuleSchema } from "@/domain/pricing/auto-adjust-rule";
import {
  buildPricingAutoAdjustAppliedV1,
  type PricingAutoAdjustAppliedV1
} from "@/shared/contracts/events/pricing-auto-adjust-applied.v1";
import { getPrismaClient } from "@/infra/prisma/prisma.client";

type AutoAdjustExecutionRecord = {
  id: string;
  listingId: string;
  runKey: string;
  traceId: string;
  ruleRevision: string | null;
  status: string;
  reasonCode: string | null;
  skipReason: string | null;
  beforePriceKrw: number | null;
  afterPriceKrw: number | null;
  eventId: string | null;
  event: unknown | null;
  evaluationAt: Date;
  appliedAt: Date | null;
  executedAt: Date;
  duplicateCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type ListingWithRuleRecord = {
  id: string;
  priceKrw: number;
  autoAdjustRule: {
    listingId: string;
    periodDays: number;
    discountRatePercent: number;
    floorPriceKrw: number;
    enabled: boolean;
    updatedAt: Date;
  } | null;
};

type AutoAdjustExecutionTransactionClient = {
  autoAdjustExecution: {
    create: (args: {
      data: {
        listingId: string;
        runKey: string;
        traceId: string;
        ruleRevision: string;
        status: string;
        evaluationAt: Date;
        executedAt: Date;
      };
    }) => Promise<AutoAdjustExecutionRecord>;
    findUnique: (args: {
      where: {
        listingId_runKey: {
          listingId: string;
          runKey: string;
        };
      };
    }) => Promise<AutoAdjustExecutionRecord | null>;
    update: (args: {
      where: {
        listingId_runKey: {
          listingId: string;
          runKey: string;
        };
      };
      data: Partial<{
        status: string;
        reasonCode: string | null;
        skipReason: string | null;
        beforePriceKrw: number | null;
        afterPriceKrw: number | null;
        eventId: string | null;
        event: unknown | null;
        evaluationAt: Date;
        appliedAt: Date | null;
        executedAt: Date;
        duplicateCount: {
          increment: number;
        };
      }>;
    }) => Promise<AutoAdjustExecutionRecord>;
    deleteMany: () => Promise<unknown>;
  };
  listing: {
    findUnique: (args: {
      where: {
        id: string;
      };
      select: {
        id: true;
        priceKrw: true;
        autoAdjustRule: {
          select: {
            listingId: true;
            periodDays: true;
            discountRatePercent: true;
            floorPriceKrw: true;
            enabled: true;
            updatedAt: true;
          };
        };
      };
    }) => Promise<ListingWithRuleRecord | null>;
    update: (args: {
      where: {
        id: string;
      };
      data: {
        priceKrw: number;
      };
    }) => Promise<unknown>;
  };
};

type AutoAdjustExecutionPersistenceClient =
  AutoAdjustExecutionTransactionClient & {
    $transaction: <T>(
      callback: (transaction: AutoAdjustExecutionTransactionClient) => Promise<T>
    ) => Promise<T>;
  };

export type ExecuteAutoAdjustRunInput = {
  listingId: string;
  runKey: string;
  traceId: string;
  requestedAt: string;
  ruleRevision: string;
  currentPriceKrw: number;
};

export type AutoAdjustExecutionRepositoryResult = AutoAdjustExecutionResult & {
  event?: PricingAutoAdjustAppliedV1;
  eventId?: string;
};

export type AutoAdjustExecutionRepository = {
  executeRun: (
    input: ExecuteAutoAdjustRunInput
  ) => Promise<AutoAdjustExecutionRepositoryResult>;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toPreviousAttempt(
  record: AutoAdjustExecutionRecord
): AutoAdjustPreviousAttempt {
  return {
    status:
      record.status === "partial-failure"
        ? "partial-failure"
        : record.status === "skipped"
          ? "skipped"
          : record.status === "duplicate"
            ? "duplicate"
            : "applied",
    runKey: record.runKey,
    appliedAt: record.appliedAt?.toISOString() ?? null
  };
}

function toDuplicateResult(args: {
  input: ExecuteAutoAdjustRunInput;
  existing: AutoAdjustExecutionRecord;
}): AutoAdjustExecutionRepositoryResult {
  return {
    listingId: args.input.listingId,
    runKey: args.input.runKey,
    traceId: args.input.traceId,
    ruleRevision: args.existing.ruleRevision,
    evaluationAt: args.input.requestedAt,
    status: "duplicate",
    duplicateOfRunKey: args.existing.runKey
  };
}

function getRuleDueAt(rule: { periodDays: number; updatedAt: string }): string {
  const dueAt = new Date(rule.updatedAt);
  dueAt.setUTCDate(dueAt.getUTCDate() + rule.periodDays);

  return dueAt.toISOString();
}

function toRuleSnapshot(listing: ListingWithRuleRecord) {
  if (!listing.autoAdjustRule) {
    return null;
  }

  return {
    ...autoAdjustRuleSchema.parse({
      ...listing.autoAdjustRule,
      updatedAt: listing.autoAdjustRule.updatedAt.toISOString()
    }),
    ruleRevision: listing.autoAdjustRule.updatedAt.toISOString()
  };
}

function toRequestedRuleSnapshot(args: {
  activeRule: ReturnType<typeof toRuleSnapshot>;
  requestedRuleRevision: string;
}) {
  if (!args.activeRule) {
    return null;
  }

  return {
    ...args.activeRule,
    ruleRevision: args.requestedRuleRevision
  };
}

async function claimRun(
  transaction: AutoAdjustExecutionTransactionClient,
  input: ExecuteAutoAdjustRunInput
): Promise<AutoAdjustExecutionRecord | null> {
  try {
    return await transaction.autoAdjustExecution.create({
      data: {
        listingId: input.listingId,
        runKey: input.runKey,
        traceId: input.traceId,
        ruleRevision: input.ruleRevision,
        status: "in-progress",
        evaluationAt: new Date(input.requestedAt),
        executedAt: new Date(input.requestedAt)
      }
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return null;
    }

    throw error;
  }
}

async function recordDuplicate(
  transaction: AutoAdjustExecutionTransactionClient,
  input: ExecuteAutoAdjustRunInput
): Promise<AutoAdjustExecutionRecord | null> {
  const existing = await transaction.autoAdjustExecution.findUnique({
    where: {
      listingId_runKey: {
        listingId: input.listingId,
        runKey: input.runKey
      }
    }
  });

  if (!existing) {
    return null;
  }

  await transaction.autoAdjustExecution.update({
    where: {
      listingId_runKey: {
        listingId: input.listingId,
        runKey: input.runKey
      }
    },
    data: {
      duplicateCount: {
        increment: 1
      }
    }
  });

  return existing;
}

async function persistResult(args: {
  transaction: AutoAdjustExecutionTransactionClient;
  input: ExecuteAutoAdjustRunInput;
  result: AutoAdjustExecutionResult;
  event?: PricingAutoAdjustAppliedV1;
  skipListingUpdate?: boolean;
}): Promise<void> {
  if (args.result.status === "duplicate") {
    return;
  }

  if (args.result.status === "applied" && !args.skipListingUpdate) {
    await args.transaction.listing.update({
      where: {
        id: args.input.listingId
      },
      data: {
        priceKrw: args.result.afterPriceKrw
      }
    });
  }

  await args.transaction.autoAdjustExecution.update({
    where: {
      listingId_runKey: {
        listingId: args.input.listingId,
        runKey: args.input.runKey
      }
    },
    data:
      args.result.status === "applied"
        ? {
            status: "applied",
            reasonCode: args.result.reasonCode,
            skipReason: null,
            beforePriceKrw: args.result.beforePriceKrw,
            afterPriceKrw: args.result.afterPriceKrw,
            eventId: args.event?.eventId ?? null,
            event: args.event ?? null,
            evaluationAt: new Date(args.result.evaluationAt),
            appliedAt: new Date(args.result.appliedAt),
            executedAt: new Date(args.result.evaluationAt)
          }
        : {
            status: "skipped",
            reasonCode: null,
            skipReason: args.result.skipReason,
            beforePriceKrw: null,
            afterPriceKrw: null,
            eventId: null,
            event: null,
            evaluationAt: new Date(args.result.evaluationAt),
            appliedAt: null,
            executedAt: new Date(args.result.evaluationAt)
          }
  });
}

function recoverAlreadyAppliedPartialFailure(args: {
  input: ExecuteAutoAdjustRunInput;
  existing: AutoAdjustExecutionRecord;
}): AutoAdjustExecutionRepositoryResult | null {
  if (
    args.existing.status !== "partial-failure" ||
    !args.existing.appliedAt ||
    args.existing.beforePriceKrw === null ||
    args.existing.afterPriceKrw === null
  ) {
    return null;
  }

  return {
    listingId: args.input.listingId,
    runKey: args.input.runKey,
    traceId: args.input.traceId,
    ruleRevision: args.existing.ruleRevision,
    evaluationAt: args.input.requestedAt,
    status: "applied",
    reasonCode: "retry-recovered",
    beforePriceKrw: args.existing.beforePriceKrw,
    afterPriceKrw: args.existing.afterPriceKrw,
    appliedAt: args.existing.appliedAt.toISOString(),
    applyCount: 1
  };
}

export function createAutoAdjustExecutionRepository(
  prismaClient: AutoAdjustExecutionPersistenceClient
): AutoAdjustExecutionRepository {
  return {
    async executeRun(input) {
      return prismaClient.$transaction(async (transaction) => {
        const claimed = await claimRun(transaction, input);
        const existing = claimed ? null : await recordDuplicate(transaction, input);

        if (existing && existing.status !== "partial-failure") {
          return toDuplicateResult({ input, existing });
        }

        const listing = await transaction.listing.findUnique({
          where: {
            id: input.listingId
          },
          select: {
            id: true,
            priceKrw: true,
            autoAdjustRule: {
              select: {
                listingId: true,
                periodDays: true,
                discountRatePercent: true,
                floorPriceKrw: true,
                enabled: true,
                updatedAt: true
              }
            }
          }
        });
        const activeRule = listing ? toRuleSnapshot(listing) : null;
        const rule = toRequestedRuleSnapshot({
          activeRule,
          requestedRuleRevision: input.ruleRevision
        });
        const activeRuleRevision = activeRule?.ruleRevision ?? null;
        const dueAt = activeRule ? getRuleDueAt(activeRule) : input.requestedAt;
        const recoveredPartial =
          existing ?
            recoverAlreadyAppliedPartialFailure({ input, existing })
          : null;
        const result = evaluateAutoAdjustExecution({
          listingId: input.listingId,
          runKey: input.runKey,
          traceId: input.traceId,
          dueAt,
          executedAt: input.requestedAt,
          currentPriceKrw: listing?.priceKrw ?? input.currentPriceKrw,
          rule: recoveredPartial ? null : rule,
          activeRuleRevision,
          previousAttempt: existing ? toPreviousAttempt(existing) : null
        });
        const finalResult = recoveredPartial ?? result;
        const event =
          finalResult.status === "applied"
            ? buildPricingAutoAdjustAppliedV1({
                listingId: finalResult.listingId,
                ruleRevision: finalResult.ruleRevision ?? input.ruleRevision,
                runKey: finalResult.runKey,
                traceId: finalResult.traceId,
                occurredAt: finalResult.appliedAt,
                beforePriceKrw: finalResult.beforePriceKrw,
                afterPriceKrw: finalResult.afterPriceKrw,
                reasonCode: finalResult.reasonCode,
                appliedAt: finalResult.appliedAt
              })
            : undefined;

        await persistResult({
          transaction,
          input,
          result: finalResult,
          event,
          skipListingUpdate: recoveredPartial !== null
        });

        return {
          ...finalResult,
          ...(event ? { event, eventId: event.eventId } : {})
        };
      });
    }
  };
}

export function getAutoAdjustExecutionRepository(): AutoAdjustExecutionRepository {
  return createAutoAdjustExecutionRepository(
    getPrismaClient() as unknown as AutoAdjustExecutionPersistenceClient
  );
}

export async function resetAutoAdjustExecutionRepository(): Promise<void> {
  const prismaClient =
    getPrismaClient() as unknown as AutoAdjustExecutionPersistenceClient;

  await prismaClient.autoAdjustExecution.deleteMany();
}
