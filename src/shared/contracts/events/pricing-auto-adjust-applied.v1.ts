import { listingIdSchema } from "@/domain/listing/listing";
import { autoAdjustExecutionReasonCodeSchema } from "@/domain/pricing/auto-adjust-execution";

import { z } from "zod";

export const pricingAutoAdjustAppliedV1Schema = z
  .object({
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    traceId: z.string().min(1),
    schemaVersion: z.literal("1.0.0"),
    payload: z
      .object({
        listingId: listingIdSchema,
        ruleRevision: z.string().trim().min(1),
        runKey: z.string().trim().min(1),
        beforePriceKrw: z.number().int().positive(),
        afterPriceKrw: z.number().int().positive(),
        reasonCode: autoAdjustExecutionReasonCodeSchema,
        appliedAt: z.iso.datetime()
      })
      .strict()
  })
  .strict();

export type PricingAutoAdjustAppliedV1 = z.infer<
  typeof pricingAutoAdjustAppliedV1Schema
>;

export type BuildPricingAutoAdjustAppliedV1Input = {
  listingId: string;
  ruleRevision: string;
  runKey: string;
  traceId: string;
  occurredAt?: string;
  beforePriceKrw: number;
  afterPriceKrw: number;
  reasonCode: z.infer<typeof autoAdjustExecutionReasonCodeSchema>;
  appliedAt: string;
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

export function buildDeterministicPricingAutoAdjustAppliedEventId(input: {
  listingId: string;
  ruleRevision: string;
  runKey: string;
  beforePriceKrw: number;
  afterPriceKrw: number;
  reasonCode: string;
  appliedAt: string;
}): string {
  const hash = fnv1a128(stableStringify(input)).split("");

  hash[12] = "5";
  hash[16] = ((Number.parseInt(hash[16] ?? "0", 16) & 0x3) | 0x8).toString(16);

  return `${hash.slice(0, 8).join("")}-${hash.slice(8, 12).join("")}-${hash
    .slice(12, 16)
    .join("")}-${hash.slice(16, 20).join("")}-${hash.slice(20, 32).join("")}`;
}

export function buildPricingAutoAdjustAppliedV1(
  input: BuildPricingAutoAdjustAppliedV1Input
): PricingAutoAdjustAppliedV1 {
  const payload = {
    listingId: input.listingId,
    ruleRevision: input.ruleRevision,
    runKey: input.runKey,
    beforePriceKrw: input.beforePriceKrw,
    afterPriceKrw: input.afterPriceKrw,
    reasonCode: input.reasonCode,
    appliedAt: input.appliedAt
  };
  const event: PricingAutoAdjustAppliedV1 = {
    eventId: buildDeterministicPricingAutoAdjustAppliedEventId(payload),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    traceId: input.traceId,
    schemaVersion: "1.0.0",
    payload
  };

  return pricingAutoAdjustAppliedV1Schema.parse(event);
}
