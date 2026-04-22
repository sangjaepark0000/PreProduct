import {
  evaluateAutoAdjustExecution,
  type EvaluateAutoAdjustExecutionInput
} from "@/domain/pricing/auto-adjust-execution";

const listingId = "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af";

const baseInput: EvaluateAutoAdjustExecutionInput = {
  listingId,
  runKey: "run-20260422-001",
  traceId: "trace-auto-adjust-20260422",
  dueAt: "2026-04-22T02:00:00.000Z",
  executedAt: "2026-04-22T02:00:00.000Z",
  currentPriceKrw: 1_850_000,
  rule: {
    listingId,
    ruleRevision: "rule-20260422-001",
    periodDays: 14,
    discountRatePercent: 8,
    floorPriceKrw: 1_200_000,
    enabled: true,
    updatedAt: "2026-04-22T00:00:00.000Z"
  }
};

describe("evaluateAutoAdjustExecution", () => {
  it("applies a due rule once and records the applied timestamp and reason", () => {
    expect(evaluateAutoAdjustExecution(baseInput)).toMatchObject({
      status: "applied",
      reasonCode: "due-rule-applied",
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      appliedAt: "2026-04-22T02:00:00.000Z",
      evaluationAt: "2026-04-22T02:00:00.000Z",
      applyCount: 1
    });
  });

  it("skips when the adjusted price would violate the floor", () => {
    expect(
      evaluateAutoAdjustExecution({
        ...baseInput,
        runKey: "run-20260422-002",
        executedAt: "2026-04-22T03:00:00.000Z",
        currentPriceKrw: 1_250_000
      })
    ).toMatchObject({
      status: "skipped",
      skipReason: "floor-violation",
      evaluationAt: "2026-04-22T03:00:00.000Z",
      currentPriceKrw: 1_250_000
    });
  });

  it("skips stale or superseded rule revisions before applying a price change", () => {
    expect(
      evaluateAutoAdjustExecution({
        ...baseInput,
        runKey: "run-20260422-003",
        rule: {
          ...baseInput.rule!,
          ruleRevision: "rule-20260421-009",
          updatedAt: "2026-04-21T23:30:00.000Z"
        },
        activeRuleRevision: "rule-20260422-002",
        executedAt: "2026-04-22T04:00:00.000Z"
      })
    ).toMatchObject({
      status: "skipped",
      skipReason: "stale-rule",
      activeRuleRevision: "rule-20260422-002",
      evaluationAt: "2026-04-22T04:00:00.000Z"
    });
  });

  it("returns duplicate for a completed previous attempt with the same run key", () => {
    expect(
      evaluateAutoAdjustExecution({
        ...baseInput,
        previousAttempt: {
          status: "applied",
          runKey: "run-20260422-001",
          appliedAt: "2026-04-22T02:00:00.000Z"
        }
      })
    ).toMatchObject({
      status: "duplicate",
      duplicateOfRunKey: "run-20260422-001"
    });
  });

  it("resumes a partial failure without producing a second apply", () => {
    expect(
      evaluateAutoAdjustExecution({
        ...baseInput,
        runKey: "run-20260422-004",
        executedAt: "2026-04-22T05:00:00.000Z",
        previousAttempt: {
          status: "partial-failure",
          runKey: "run-20260422-004",
          appliedAt: "2026-04-22T04:59:59.000Z"
        }
      })
    ).toMatchObject({
      status: "applied",
      reasonCode: "retry-recovered",
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      appliedAt: "2026-04-22T05:00:00.000Z",
      applyCount: 1
    });
  });

  it("skips when the scheduler executes before the due instant", () => {
    expect(
      evaluateAutoAdjustExecution({
        ...baseInput,
        executedAt: "2026-04-22T01:59:59.999Z"
      })
    ).toMatchObject({
      status: "skipped",
      skipReason: "not-due"
    });
  });
});
