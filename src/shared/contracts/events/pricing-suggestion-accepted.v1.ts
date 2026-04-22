import {
  pricingConfirmationInputSchema,
  pricingConfirmationModeSchema
} from "@/shared/contracts/pricing-suggestion";

import { z } from "zod";

export const pricingSuggestionAcceptedV1Schema = z
  .object({
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    traceId: z.string().min(1),
    schemaVersion: z.literal("1.0.0"),
    payload: z
      .object({
        clientRequestId: z.string().min(1),
        idempotencyKey: z.string().min(1),
        basisRevision: z.string().min(1),
        suggestedPriceKrw: z.number().int().positive(),
        confirmedPriceKrw: z.number().int().positive(),
        mode: pricingConfirmationModeSchema,
        deltaKrw: z.number().int(),
        manualReason: z.string().trim().optional()
      })
      .strict()
  })
  .strict();

export type PricingSuggestionAcceptedV1 = z.infer<
  typeof pricingSuggestionAcceptedV1Schema
>;

export type BuildPricingSuggestionAcceptedV1Input = z.input<
  typeof pricingConfirmationInputSchema
> & {
  occurredAt?: string;
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function fnv1a128(input: string): string {
  let first = 0x6c62272e07bb0142n;
  let second = 0x62b821756295c58dn;
  const prime = 0x100000001b3n;
  const mask = (1n << 64n) - 1n;

  for (let index = 0; index < input.length; index += 1) {
    first ^= BigInt(input.charCodeAt(index));
    first = (first * prime) & mask;
    second ^= BigInt(input.charCodeAt(input.length - index - 1));
    second = (second * prime) & mask;
  }

  return `${first.toString(16).padStart(16, "0")}${second
    .toString(16)
    .padStart(16, "0")}`;
}

export function buildDeterministicPricingSuggestionAcceptedEventId(input: {
  idempotencyKey: string;
  basisRevision: string;
  confirmedPriceKrw: number;
  mode: string;
}): string {
  const hash = fnv1a128(stableStringify(input)).split("");

  hash[12] = "5";
  hash[16] = ((Number.parseInt(hash[16] ?? "0", 16) & 0x3) | 0x8).toString(16);

  return `${hash.slice(0, 8).join("")}-${hash.slice(8, 12).join("")}-${hash
    .slice(12, 16)
    .join("")}-${hash.slice(16, 20).join("")}-${hash.slice(20, 32).join("")}`;
}

export function buildPricingSuggestionAcceptedV1(
  input: BuildPricingSuggestionAcceptedV1Input
): PricingSuggestionAcceptedV1 {
  const { occurredAt, ...confirmationInput } = input;
  const parsedInput = pricingConfirmationInputSchema.parse(confirmationInput);
  const event: PricingSuggestionAcceptedV1 = {
    eventId: buildDeterministicPricingSuggestionAcceptedEventId({
      idempotencyKey: parsedInput.idempotencyKey,
      basisRevision: parsedInput.basisRevision,
      confirmedPriceKrw: parsedInput.confirmedPriceKrw,
      mode: parsedInput.mode
    }),
    occurredAt: occurredAt ?? new Date().toISOString(),
    traceId: parsedInput.traceId,
    schemaVersion: "1.0.0",
    payload: {
      clientRequestId: parsedInput.clientRequestId,
      idempotencyKey: parsedInput.idempotencyKey,
      basisRevision: parsedInput.basisRevision,
      suggestedPriceKrw: parsedInput.suggestedPriceKrw,
      confirmedPriceKrw: parsedInput.confirmedPriceKrw,
      mode: parsedInput.mode,
      deltaKrw:
        parsedInput.confirmedPriceKrw - parsedInput.suggestedPriceKrw,
      ...(parsedInput.manualReason
        ? { manualReason: parsedInput.manualReason }
        : {})
    }
  };

  return pricingSuggestionAcceptedV1Schema.parse(event);
}
