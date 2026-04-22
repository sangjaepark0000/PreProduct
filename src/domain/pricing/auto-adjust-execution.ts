import {
  autoAdjustRuleSchema,
  type AutoAdjustRule
} from "@/domain/pricing/auto-adjust-rule";
import { listingIdSchema, listingPricePolicy } from "@/domain/listing/listing";

import { z } from "zod";

export const autoAdjustExecutionReasonCodeSchema = z.enum([
  "due-rule-applied",
  "retry-recovered"
]);

export const autoAdjustExecutionSkipReasonSchema = z.enum([
  "not-due",
  "disabled-rule",
  "missing-rule",
  "stale-rule",
  "floor-violation"
]);

export const autoAdjustExecutionStatusSchema = z.enum([
  "applied",
  "skipped",
  "duplicate",
  "partial-failure"
]);

export type AutoAdjustExecutionReasonCode = z.infer<
  typeof autoAdjustExecutionReasonCodeSchema
>;
export type AutoAdjustExecutionSkipReason = z.infer<
  typeof autoAdjustExecutionSkipReasonSchema
>;
export type AutoAdjustExecutionStatus = z.infer<
  typeof autoAdjustExecutionStatusSchema
>;

export type AutoAdjustRuleExecutionSnapshot = AutoAdjustRule & {
  ruleRevision: string;
};

export type AutoAdjustPreviousAttempt = {
  status: AutoAdjustExecutionStatus;
  runKey: string;
  appliedAt?: string | null;
};

export type EvaluateAutoAdjustExecutionInput = {
  listingId: string;
  runKey: string;
  traceId: string;
  dueAt: string;
  executedAt: string;
  currentPriceKrw: number;
  rule: AutoAdjustRuleExecutionSnapshot | null;
  activeRuleRevision?: string | null;
  previousAttempt?: AutoAdjustPreviousAttempt | null;
};

type AutoAdjustExecutionBaseResult = {
  listingId: string;
  runKey: string;
  traceId: string;
  ruleRevision: string | null;
  evaluationAt: string;
};

export type AutoAdjustExecutionAppliedResult =
  AutoAdjustExecutionBaseResult & {
    status: "applied";
    reasonCode: AutoAdjustExecutionReasonCode;
    beforePriceKrw: number;
    afterPriceKrw: number;
    appliedAt: string;
    applyCount: 1;
  };

export type AutoAdjustExecutionSkippedResult =
  AutoAdjustExecutionBaseResult & {
    status: "skipped";
    skipReason: AutoAdjustExecutionSkipReason;
    currentPriceKrw: number;
    activeRuleRevision?: string;
  };

export type AutoAdjustExecutionDuplicateResult =
  AutoAdjustExecutionBaseResult & {
    status: "duplicate";
    duplicateOfRunKey: string;
  };

export type AutoAdjustExecutionResult =
  | AutoAdjustExecutionAppliedResult
  | AutoAdjustExecutionSkippedResult
  | AutoAdjustExecutionDuplicateResult;

const executionInputSchema = z.object({
  listingId: listingIdSchema,
  runKey: z.string().trim().min(1),
  traceId: z.string().trim().min(1),
  dueAt: z.iso.datetime(),
  executedAt: z.iso.datetime(),
  currentPriceKrw: z
    .number()
    .int()
    .min(listingPricePolicy.minPriceKrw)
    .max(listingPricePolicy.maxPriceKrw),
  rule: autoAdjustRuleSchema
    .extend({
      ruleRevision: z.string().trim().min(1)
    })
    .nullable(),
  activeRuleRevision: z.string().trim().min(1).nullable().optional(),
  previousAttempt: z
    .object({
      status: autoAdjustExecutionStatusSchema,
      runKey: z.string().trim().min(1),
      appliedAt: z.iso.datetime().nullable().optional()
    })
    .nullable()
    .optional()
});

function buildBaseResult(
  input: z.infer<typeof executionInputSchema>
): AutoAdjustExecutionBaseResult {
  return {
    listingId: input.listingId,
    runKey: input.runKey,
    traceId: input.traceId,
    ruleRevision: input.rule?.ruleRevision ?? null,
    evaluationAt: input.executedAt
  };
}

function calculateAdjustedPriceKrw(input: {
  currentPriceKrw: number;
  discountRatePercent: number;
}): number {
  const discounted =
    input.currentPriceKrw * ((100 - input.discountRatePercent) / 100);

  return Math.floor(discounted / listingPricePolicy.stepKrw) *
    listingPricePolicy.stepKrw;
}

function skippedResult(
  input: z.infer<typeof executionInputSchema>,
  skipReason: AutoAdjustExecutionSkipReason
): AutoAdjustExecutionSkippedResult {
  return {
    ...buildBaseResult(input),
    status: "skipped",
    skipReason,
    currentPriceKrw: input.currentPriceKrw,
    ...(input.activeRuleRevision
      ? { activeRuleRevision: input.activeRuleRevision }
      : {})
  };
}

export function evaluateAutoAdjustExecution(
  rawInput: EvaluateAutoAdjustExecutionInput
): AutoAdjustExecutionResult {
  const input = executionInputSchema.parse(rawInput);

  if (
    input.previousAttempt &&
    input.previousAttempt.status !== "partial-failure"
  ) {
    return {
      ...buildBaseResult(input),
      status: "duplicate",
      duplicateOfRunKey: input.previousAttempt.runKey
    };
  }

  if (!input.rule) {
    return skippedResult(input, "missing-rule");
  }

  if (!input.rule.enabled) {
    return skippedResult(input, "disabled-rule");
  }

  if (
    input.activeRuleRevision &&
    input.activeRuleRevision !== input.rule.ruleRevision
  ) {
    return skippedResult(input, "stale-rule");
  }

  if (new Date(input.executedAt).getTime() < new Date(input.dueAt).getTime()) {
    return skippedResult(input, "not-due");
  }

  const afterPriceKrw = calculateAdjustedPriceKrw({
    currentPriceKrw: input.currentPriceKrw,
    discountRatePercent: input.rule.discountRatePercent
  });

  if (afterPriceKrw < input.rule.floorPriceKrw) {
    return skippedResult(input, "floor-violation");
  }

  return {
    ...buildBaseResult(input),
    status: "applied",
    reasonCode:
      input.previousAttempt?.status === "partial-failure"
        ? "retry-recovered"
        : "due-rule-applied",
    beforePriceKrw: input.currentPriceKrw,
    afterPriceKrw,
    appliedAt: input.executedAt,
    applyCount: 1
  };
}
