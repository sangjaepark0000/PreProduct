import { z } from "zod";

export const pricingConfirmationModeValues = ["accepted", "edited"] as const;

export const pricingSuggestionBasisSchema = z
  .object({
    title: z.string().trim(),
    category: z.string().trim(),
    keySpecifications: z.array(z.string().trim()),
    basisRevision: z.string().min(1)
  })
  .strict();

export const pricingSuggestionSchema = z
  .object({
    suggestedPriceKrw: z.number().int().positive(),
    minPriceKrw: z.number().int().positive(),
    maxPriceKrw: z.number().int().positive(),
    confidence: z.number().min(0).max(1),
    rationale: z.string().min(1),
    basis: pricingSuggestionBasisSchema
  })
  .strict();

export const pricingConfirmationModeSchema = z.enum(
  pricingConfirmationModeValues
);

export const pricingConfirmationInputSchema = z
  .object({
    clientRequestId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    traceId: z.string().min(1),
    basisRevision: z.string().min(1),
    suggestedPriceKrw: z.number().int().positive(),
    confirmedPriceKrw: z.number().int().positive(),
    mode: pricingConfirmationModeSchema,
    manualReason: z.string().trim().optional()
  })
  .strict();

export type PricingSuggestionBasis = z.infer<
  typeof pricingSuggestionBasisSchema
>;
export type PricingSuggestion = z.infer<typeof pricingSuggestionSchema>;
export type PricingConfirmationMode = z.infer<
  typeof pricingConfirmationModeSchema
>;
export type PricingConfirmationInput = z.infer<
  typeof pricingConfirmationInputSchema
>;
