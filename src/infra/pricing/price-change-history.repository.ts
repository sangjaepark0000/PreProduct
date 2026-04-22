import {
  buildMinimalSignalFromPriceChange,
  buildPriceChangeHistoryRow,
  type PriceChangeHistoryRow
} from "@/domain/pricing/price-change-history";
import { autoAdjustExecutionReasonCodeSchema } from "@/domain/pricing/auto-adjust-execution";
import { type PricingAutoAdjustMinimalSignalV1 } from "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1";
import { getPrismaClient } from "@/infra/prisma/prisma.client";

type AppliedAutoAdjustExecutionRecord = {
  listingId: string;
  reasonCode: string | null;
  beforePriceKrw: number | null;
  afterPriceKrw: number | null;
  appliedAt: Date | null;
};

type PriceChangeHistoryPersistenceClient = {
  autoAdjustExecution: {
    findMany: (args: {
      where: {
        listingId: string;
        status: "applied";
        appliedAt: {
          not: null;
        };
      };
      orderBy: {
        appliedAt: "desc";
      };
      select: {
        listingId: true;
        reasonCode: true;
        beforePriceKrw: true;
        afterPriceKrw: true;
        appliedAt: true;
      };
    }) => Promise<AppliedAutoAdjustExecutionRecord[]>;
  };
};

export type PriceChangeHistoryRepository = {
  listForListing: (listingId: string) => Promise<PriceChangeHistoryRow[]>;
  listMinimalSignalsForListing: (
    listingId: string
  ) => Promise<PricingAutoAdjustMinimalSignalV1[]>;
};

function toAppliedPriceChangeSource(record: AppliedAutoAdjustExecutionRecord) {
  const parsedReasonCode = autoAdjustExecutionReasonCodeSchema.safeParse(
    record.reasonCode
  );

  if (
    !parsedReasonCode.success ||
    record.beforePriceKrw === null ||
    record.afterPriceKrw === null ||
    record.appliedAt === null
  ) {
    return null;
  }

  return {
    listingId: record.listingId,
    beforePriceKrw: record.beforePriceKrw,
    afterPriceKrw: record.afterPriceKrw,
    appliedAt: record.appliedAt.toISOString(),
    reasonCode: parsedReasonCode.data
  };
}

async function findAppliedRecords(
  prismaClient: PriceChangeHistoryPersistenceClient,
  listingId: string
): Promise<AppliedAutoAdjustExecutionRecord[]> {
  return prismaClient.autoAdjustExecution.findMany({
    where: {
      listingId,
      status: "applied",
      appliedAt: {
        not: null
      }
    },
    orderBy: {
      appliedAt: "desc"
    },
    select: {
      listingId: true,
      reasonCode: true,
      beforePriceKrw: true,
      afterPriceKrw: true,
      appliedAt: true
    }
  });
}

export function createPriceChangeHistoryRepository(
  prismaClient: PriceChangeHistoryPersistenceClient
): PriceChangeHistoryRepository {
  return {
    async listForListing(listingId) {
      const records = await findAppliedRecords(prismaClient, listingId);

      return records
        .map(toAppliedPriceChangeSource)
        .filter((source): source is NonNullable<typeof source> => source !== null)
        .map(buildPriceChangeHistoryRow);
    },
    async listMinimalSignalsForListing(listingId) {
      const records = await findAppliedRecords(prismaClient, listingId);

      return records
        .map(toAppliedPriceChangeSource)
        .filter((source): source is NonNullable<typeof source> => source !== null)
        .map(buildMinimalSignalFromPriceChange);
    }
  };
}

export function getPriceChangeHistoryRepository(): PriceChangeHistoryRepository {
  return createPriceChangeHistoryRepository(
    getPrismaClient() as unknown as PriceChangeHistoryPersistenceClient
  );
}
