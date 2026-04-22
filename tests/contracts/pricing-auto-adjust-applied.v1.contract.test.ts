import fixture from "./fixtures/pricing.auto-adjust.applied.v1.json";
import {
  buildPricingAutoAdjustAppliedV1,
  pricingAutoAdjustAppliedV1Schema
} from "@/shared/contracts/events/pricing-auto-adjust-applied.v1";

describe("pricing.auto_adjust.applied.v1 contract", () => {
  it("accepts the canonical fixture", () => {
    expect(pricingAutoAdjustAppliedV1Schema.parse(fixture)).toEqual(fixture);
  });

  it("creates a deterministic eventId for identical execution inputs", () => {
    const input = {
      listingId: fixture.payload.listingId,
      ruleRevision: fixture.payload.ruleRevision,
      runKey: fixture.payload.runKey,
      traceId: fixture.traceId,
      occurredAt: fixture.occurredAt,
      beforePriceKrw: fixture.payload.beforePriceKrw,
      afterPriceKrw: fixture.payload.afterPriceKrw,
      reasonCode: fixture.payload.reasonCode as "due-rule-applied",
      appliedAt: fixture.payload.appliedAt
    };

    const first = buildPricingAutoAdjustAppliedV1(input);
    const second = buildPricingAutoAdjustAppliedV1(input);

    expect(second.eventId).toBe(first.eventId);
    expect(first).toEqual(fixture);
  });

  it("rejects an event that drops required common or execution fields", () => {
    expect(() =>
      pricingAutoAdjustAppliedV1Schema.parse({
        ...fixture,
        traceId: undefined,
        payload: {
          listingId: fixture.payload.listingId,
          ruleRevision: fixture.payload.ruleRevision,
          beforePriceKrw: fixture.payload.beforePriceKrw,
          afterPriceKrw: fixture.payload.afterPriceKrw,
          appliedAt: fixture.payload.appliedAt
        }
      })
    ).toThrow();
  });
});
