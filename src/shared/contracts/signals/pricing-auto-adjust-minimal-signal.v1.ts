import { listingIdSchema } from "@/domain/listing/listing";
import { autoAdjustExecutionReasonCodeSchema } from "@/domain/pricing/auto-adjust-execution";

import { z } from "zod";

export const pricingAutoAdjustMinimalSignalV1Schema = z
  .object({
    listingId: listingIdSchema,
    updatedAt: z.iso.datetime(),
    reasonCode: autoAdjustExecutionReasonCodeSchema
  })
  .strict();

export type PricingAutoAdjustMinimalSignalV1 = z.infer<
  typeof pricingAutoAdjustMinimalSignalV1Schema
>;

export type BuildPricingAutoAdjustMinimalSignalV1Input =
  PricingAutoAdjustMinimalSignalV1;

export function buildPricingAutoAdjustMinimalSignalV1(
  input: BuildPricingAutoAdjustMinimalSignalV1Input
): PricingAutoAdjustMinimalSignalV1 {
  return pricingAutoAdjustMinimalSignalV1Schema.parse(input);
}
