const canonicalEvent = {
  eventId: "8f7f4be7-53a6-48e2-9a8f-0df8f0a4ac12",
  occurredAt: "2026-04-22T02:00:00.000Z",
  traceId: "trace-auto-adjust-20260422",
  schemaVersion: "1.0.0" as const,
  payload: {
    listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
    ruleRevision: "rule-20260422-001",
    runKey: "run-20260422-001",
    beforePriceKrw: 1_850_000,
    afterPriceKrw: 1_702_000,
    reasonCode: "due-rule-applied",
    appliedAt: "2026-04-22T02:00:00.000Z"
  }
};

describe("pricing.auto_adjust.applied.v1 contract", () => {
  test.skip("[P0] accepts the canonical execution event", async () => {
    // Given: a fully populated applied event envelope.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const {
      buildPricingAutoAdjustAppliedV1,
      pricingAutoAdjustAppliedV1Schema
    } = await import(
      "@/shared/contracts/events/pricing-auto-adjust-applied.v1"
    );

    expect(pricingAutoAdjustAppliedV1Schema.parse(canonicalEvent)).toEqual(
      canonicalEvent
    );

    const built = buildPricingAutoAdjustAppliedV1({
      listingId: canonicalEvent.payload.listingId,
      ruleRevision: canonicalEvent.payload.ruleRevision,
      runKey: canonicalEvent.payload.runKey,
      traceId: canonicalEvent.traceId,
      occurredAt: canonicalEvent.occurredAt,
      beforePriceKrw: canonicalEvent.payload.beforePriceKrw,
      afterPriceKrw: canonicalEvent.payload.afterPriceKrw,
      reasonCode: canonicalEvent.payload.reasonCode,
      appliedAt: canonicalEvent.payload.appliedAt
    });

    expect(built.payload).toEqual(canonicalEvent.payload);
    expect(built.schemaVersion).toBe("1.0.0");
  });

  test.skip(
    "[P0] creates a deterministic eventId for identical execution inputs",
    async () => {
      // Given: identical listing, rule, run key, and execution payload values.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { buildPricingAutoAdjustAppliedV1 } = await import(
        "@/shared/contracts/events/pricing-auto-adjust-applied.v1"
      );

      const input = {
        listingId: canonicalEvent.payload.listingId,
        ruleRevision: canonicalEvent.payload.ruleRevision,
        runKey: canonicalEvent.payload.runKey,
        traceId: canonicalEvent.traceId,
        occurredAt: canonicalEvent.occurredAt,
        beforePriceKrw: canonicalEvent.payload.beforePriceKrw,
        afterPriceKrw: canonicalEvent.payload.afterPriceKrw,
        reasonCode: canonicalEvent.payload.reasonCode,
        appliedAt: canonicalEvent.payload.appliedAt
      };

      const first = buildPricingAutoAdjustAppliedV1(input);
      const second = buildPricingAutoAdjustAppliedV1(input);

      expect(second.eventId).toBe(first.eventId);
      expect(first.payload.runKey).toBe(canonicalEvent.payload.runKey);
    }
  );

  test.skip(
    "[P0] rejects an event that drops run-key or reason fields",
    async () => {
      // Given: a payload that omits the fields Epic 3 must persist for downstream history.
      // @ts-ignore -- ATDD red phase imports the target story module before implementation.
      const { pricingAutoAdjustAppliedV1Schema } = await import(
        "@/shared/contracts/events/pricing-auto-adjust-applied.v1"
      );

      expect(() =>
        pricingAutoAdjustAppliedV1Schema.parse({
          ...canonicalEvent,
          payload: {
            listingId: canonicalEvent.payload.listingId,
            ruleRevision: canonicalEvent.payload.ruleRevision,
            beforePriceKrw: canonicalEvent.payload.beforePriceKrw,
            afterPriceKrw: canonicalEvent.payload.afterPriceKrw,
            appliedAt: canonicalEvent.payload.appliedAt
          }
        })
      ).toThrow();
    }
  );
});
