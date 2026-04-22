import { Prisma } from "@prisma/client";

import {
  autoAdjustRuleInputSchema,
  autoAdjustRuleSchema,
  RetryableAutoAdjustRuleSaveError,
  type AutoAdjustRule,
  type AutoAdjustRuleInput
} from "@/domain/pricing/auto-adjust-rule";
import { getPrismaClient } from "@/infra/prisma/prisma.client";

type AutoAdjustRuleRecord = {
  listingId: string;
  periodDays: number;
  discountRatePercent: number;
  floorPriceKrw: number;
  enabled: boolean;
  updatedAt: Date;
};

type AutoAdjustRulePersistenceClient = {
  autoAdjustRule: {
    findUnique: (args: {
      where: {
        listingId: string;
      };
    }) => Promise<AutoAdjustRuleRecord | null>;
    upsert: (args: {
      where: {
        listingId: string;
      };
      update: {
        periodDays: number;
        discountRatePercent: number;
        floorPriceKrw: number;
        enabled: boolean;
      };
      create: {
        listingId: string;
        periodDays: number;
        discountRatePercent: number;
        floorPriceKrw: number;
        enabled: boolean;
      };
    }) => Promise<AutoAdjustRuleRecord>;
    deleteMany: () => Promise<unknown>;
  };
};

export type AutoAdjustRuleRepository = {
  findActiveByListingId: (listingId: string) => Promise<AutoAdjustRule | null>;
  upsertActive: (input: AutoAdjustRuleInput) => Promise<AutoAdjustRule | null>;
};

function toDomainAutoAdjustRule(record: AutoAdjustRuleRecord): AutoAdjustRule {
  return autoAdjustRuleSchema.parse({
    ...record,
    updatedAt: record.updatedAt.toISOString()
  });
}

function isRetryableRuleWriteError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export function createAutoAdjustRuleRepository(
  prismaClient: AutoAdjustRulePersistenceClient
): AutoAdjustRuleRepository {
  return {
    async findActiveByListingId(listingId) {
      const parsedListingId = autoAdjustRuleInputSchema.shape.listingId.parse(
        listingId
      );
      const storedRule = await prismaClient.autoAdjustRule.findUnique({
        where: {
          listingId: parsedListingId
        }
      });

      if (!storedRule || !storedRule.enabled) {
        return null;
      }

      return toDomainAutoAdjustRule(storedRule);
    },
    async upsertActive(input) {
      const parsedInput = autoAdjustRuleInputSchema.parse(input);
      let storedRule: AutoAdjustRuleRecord;

      try {
        storedRule = await prismaClient.autoAdjustRule.upsert({
          where: {
            listingId: parsedInput.listingId
          },
          update: {
            periodDays: parsedInput.periodDays,
            discountRatePercent: parsedInput.discountRatePercent,
            floorPriceKrw: parsedInput.floorPriceKrw,
            enabled: true
          },
          create: {
            listingId: parsedInput.listingId,
            periodDays: parsedInput.periodDays,
            discountRatePercent: parsedInput.discountRatePercent,
            floorPriceKrw: parsedInput.floorPriceKrw,
            enabled: true
          }
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2003"
        ) {
          return null;
        }

        if (isRetryableRuleWriteError(error)) {
          throw new RetryableAutoAdjustRuleSaveError(undefined, {
            cause: error
          });
        }

        throw error;
      }

      return toDomainAutoAdjustRule(storedRule);
    }
  };
}

export function getAutoAdjustRuleRepository(): AutoAdjustRuleRepository {
  return createAutoAdjustRuleRepository(getPrismaClient());
}

export async function resetAutoAdjustRuleRepository(): Promise<void> {
  await getPrismaClient().autoAdjustRule.deleteMany();
}

