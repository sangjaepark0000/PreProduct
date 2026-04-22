import fixture from "./fixtures/pricing.suggestion.accepted.v1.json";
import {
  buildPricingSuggestionAcceptedV1,
  pricingSuggestionAcceptedV1Schema
} from "@/shared/contracts/events/pricing-suggestion-accepted.v1";

describe("pricing.suggestion.accepted.v1 contract", () => {
  it("accepts the canonical fixture", () => {
    expect(pricingSuggestionAcceptedV1Schema.parse(fixture)).toEqual(fixture);
  });

  it("creates a deterministic eventId for identical confirmation inputs", () => {
    const input = {
      clientRequestId: "client-deterministic-atdd",
      idempotencyKey: "idem-deterministic-atdd",
      traceId: "trace-deterministic-atdd",
      occurredAt: "2026-04-22T02:00:00.000Z",
      basisRevision: "basis-deterministic-atdd",
      suggestedPriceKrw: 1_240_000,
      confirmedPriceKrw: 1_180_000,
      mode: "edited" as const,
      manualReason: "구성품 누락을 반영한 수동 수정"
    };

    const first = buildPricingSuggestionAcceptedV1(input);
    const second = buildPricingSuggestionAcceptedV1(input);

    expect(second.eventId).toBe(first.eventId);
    expect(first.payload.deltaKrw).toBe(-60_000);
    expect(first.payload.mode).toBe("edited");
  });

  it("rejects a pricing event that drops idempotency or revision fields", () => {
    expect(() =>
      pricingSuggestionAcceptedV1Schema.parse({
        ...fixture,
        payload: {
          clientRequestId: fixture.payload.clientRequestId,
          confirmedPriceKrw: fixture.payload.confirmedPriceKrw,
          mode: fixture.payload.mode
        }
      })
    ).toThrow();
  });
});
