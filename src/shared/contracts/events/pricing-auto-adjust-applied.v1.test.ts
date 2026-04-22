import {
  buildPricingAutoAdjustAppliedV1,
  pricingAutoAdjustAppliedV1Schema
} from "@/shared/contracts/events/pricing-auto-adjust-applied.v1";

const canonicalEvent = {
  eventId: "da7ff09a-5629-5d44-a28c-a8fd8748156d",
  occurredAt: "2026-04-22T02:00:00.000Z",
  traceId: "trace-auto-adjust-20260422",
  schemaVersion: "1.0.0" as const,
  payload: {
    listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
    ruleRevision: "rule-20260422-001",
    runKey: "run-20260422-001",
    beforePriceKrw: 1_850_000,
    afterPriceKrw: 1_702_000,
    reasonCode: "due-rule-applied" as const,
    appliedAt: "2026-04-22T02:00:00.000Z"
  }
};

describe("pricingAutoAdjustAppliedV1Schema", () => {
  it("accepts the canonical execution event", () => {
    expect(pricingAutoAdjustAppliedV1Schema.parse(canonicalEvent)).toEqual(
      canonicalEvent
    );
  });

  it("creates a deterministic eventId for identical execution inputs", () => {
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
    expect(first).toEqual(canonicalEvent);
  });

  it("rejects an event that drops run-key or reason fields", () => {
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
  });
});
