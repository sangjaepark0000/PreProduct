describe("Story 3.2 auto-adjust execution domain contract (ATDD RED)", () => {
  test.skip(
    "[P0] applies a due rule once and records the applied timestamp and reason",
    async () => {
      // Given: a due execution window, a valid active rule, and a stable clock.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { evaluateAutoAdjustExecution } = await import(
        "@/domain/pricing/auto-adjust-execution"
      );

      const result = evaluateAutoAdjustExecution({
        listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
        runKey: "run-20260422-001",
        traceId: "trace-auto-adjust-20260422",
        dueAt: "2026-04-22T02:00:00.000Z",
        executedAt: "2026-04-22T02:00:00.000Z",
        currentPriceKrw: 1_850_000,
        rule: {
          listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
          ruleRevision: "rule-20260422-001",
          periodDays: 14,
          discountRatePercent: 8,
          floorPriceKrw: 1_200_000,
          enabled: true,
          updatedAt: "2026-04-22T00:00:00.000Z"
        }
      });

      expect(result).toEqual({
        status: "applied",
        reasonCode: "due-rule-applied",
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: "2026-04-22T02:00:00.000Z"
      });
    }
  );

  test.skip(
    "[P0] skips when the floor would be violated and records a stable skip reason",
    async () => {
      // Given: the active rule would push the listing below the configured floor.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { evaluateAutoAdjustExecution } = await import(
        "@/domain/pricing/auto-adjust-execution"
      );

      const result = evaluateAutoAdjustExecution({
        listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
        runKey: "run-20260422-002",
        traceId: "trace-auto-adjust-20260422",
        dueAt: "2026-04-22T03:00:00.000Z",
        executedAt: "2026-04-22T03:00:00.000Z",
        currentPriceKrw: 1_250_000,
        rule: {
          listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
          ruleRevision: "rule-20260422-001",
          periodDays: 14,
          discountRatePercent: 8,
          floorPriceKrw: 1_200_000,
          enabled: true,
          updatedAt: "2026-04-22T00:00:00.000Z"
        }
      });

      expect(result).toEqual({
        status: "skipped",
        skipReason: "floor-violation",
        evaluatedAt: "2026-04-22T03:00:00.000Z"
      });
    }
  );

  test.skip(
    "[P0] skips stale or superseded rules before applying a price change",
    async () => {
      // Given: a stale rule revision that has been superseded by a newer active rule.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { evaluateAutoAdjustExecution } = await import(
        "@/domain/pricing/auto-adjust-execution"
      );

      const result = evaluateAutoAdjustExecution({
        listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
        runKey: "run-20260422-003",
        traceId: "trace-auto-adjust-20260422",
        dueAt: "2026-04-22T04:00:00.000Z",
        executedAt: "2026-04-22T04:00:00.000Z",
        currentPriceKrw: 1_850_000,
        rule: {
          listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
          ruleRevision: "rule-20260421-009",
          periodDays: 14,
          discountRatePercent: 8,
          floorPriceKrw: 1_200_000,
          enabled: true,
          updatedAt: "2026-04-21T23:30:00.000Z"
        },
        activeRuleRevision: "rule-20260422-002"
      });

      expect(result).toEqual({
        status: "skipped",
        skipReason: "stale-rule",
        evaluatedAt: "2026-04-22T04:00:00.000Z",
        activeRuleRevision: "rule-20260422-002"
      });
    }
  );

  test.skip(
    "[P1] resumes after a partial failure without producing a second apply",
    async () => {
      // Given: the same run key is retried after a partial persistence failure.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { evaluateAutoAdjustExecution } = await import(
        "@/domain/pricing/auto-adjust-execution"
      );

      const result = evaluateAutoAdjustExecution({
        listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
        runKey: "run-20260422-004",
        traceId: "trace-auto-adjust-20260422",
        dueAt: "2026-04-22T05:00:00.000Z",
        executedAt: "2026-04-22T05:00:00.000Z",
        currentPriceKrw: 1_850_000,
        rule: {
          listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
          ruleRevision: "rule-20260422-001",
          periodDays: 14,
          discountRatePercent: 8,
          floorPriceKrw: 1_200_000,
          enabled: true,
          updatedAt: "2026-04-22T00:00:00.000Z"
        },
        previousAttempt: {
          status: "partial-failure",
          runKey: "run-20260422-004",
          appliedAt: "2026-04-22T04:59:59.000Z"
        }
      });

      expect(result).toEqual({
        status: "applied",
        reasonCode: "retry-recovered",
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: "2026-04-22T05:00:00.000Z",
        applyCount: 1
      });
    }
  );
});
