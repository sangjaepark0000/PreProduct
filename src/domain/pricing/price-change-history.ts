import { listingIdSchema, listingPricePolicy } from "@/domain/listing/listing";
import { autoAdjustExecutionReasonCodeSchema } from "@/domain/pricing/auto-adjust-execution";
import {
  buildPricingAutoAdjustMinimalSignalV1,
  type PricingAutoAdjustMinimalSignalV1
} from "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1";

import { z } from "zod";

export const priceChangeHistoryRowSchema = z
  .object({
    listingId: listingIdSchema,
    beforePriceKrw: z
      .number()
      .int()
      .min(listingPricePolicy.minPriceKrw)
      .max(listingPricePolicy.maxPriceKrw),
    afterPriceKrw: z
      .number()
      .int()
      .min(listingPricePolicy.minPriceKrw)
      .max(listingPricePolicy.maxPriceKrw),
    appliedAt: z.iso.datetime(),
    reasonCode: autoAdjustExecutionReasonCodeSchema
  })
  .strict();

export type PriceChangeHistoryRow = z.infer<typeof priceChangeHistoryRowSchema>;

export type AppliedPriceChangeSource = {
  listingId: string;
  beforePriceKrw: number;
  afterPriceKrw: number;
  appliedAt: string;
  reasonCode: z.infer<typeof autoAdjustExecutionReasonCodeSchema>;
};

export function buildPriceChangeHistoryRow(
  source: AppliedPriceChangeSource
): PriceChangeHistoryRow {
  return priceChangeHistoryRowSchema.parse(source);
}

export function buildMinimalSignalFromPriceChange(
  source: AppliedPriceChangeSource
): PricingAutoAdjustMinimalSignalV1 {
  const historyRow = buildPriceChangeHistoryRow(source);

  return buildPricingAutoAdjustMinimalSignalV1({
    listingId: historyRow.listingId,
    updatedAt: historyRow.appliedAt,
    reasonCode: historyRow.reasonCode
  });
}
