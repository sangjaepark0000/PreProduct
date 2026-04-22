import { listingIdSchema, listingPricePolicy } from "@/domain/listing/listing";
import {
  getAutoAdjustExecutionRepository,
  type AutoAdjustExecutionRepository,
  type AutoAdjustExecutionRepositoryResult
} from "@/infra/pricing/auto-adjust-execution.repository";

import { z } from "zod";

export const autoAdjustExecutionRequestSchema = z
  .object({
    listingId: listingIdSchema,
    runKey: z.string().trim().min(1),
    traceId: z.string().trim().min(1),
    requestedAt: z.iso.datetime(),
    ruleRevision: z.string().trim().min(1),
    currentPriceKrw: z
      .number()
      .int()
      .min(listingPricePolicy.minPriceKrw)
      .max(listingPricePolicy.maxPriceKrw)
  })
  .strict();

export type AutoAdjustExecutionRequest = z.infer<
  typeof autoAdjustExecutionRequestSchema
>;

export async function runAutoAdjustExecution(
  rawRequest: unknown,
  options: {
    repository?: AutoAdjustExecutionRepository;
  } = {}
): Promise<AutoAdjustExecutionRepositoryResult> {
  const request = autoAdjustExecutionRequestSchema.parse(rawRequest);
  const repository =
    options.repository ?? getAutoAdjustExecutionRepository();

  return repository.executeRun(request);
}
