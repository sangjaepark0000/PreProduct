import { expect, test } from "@playwright/test";

import canonicalFixture from "./fixtures/pricing.suggestion.accepted.v1.json";
import { createPricingConfirmationScenario } from "../support/factories/pricing-confirmation.factory";

test.describe("Story 2.3 pricing.suggestion.accepted.v1 contract (ATDD RED)", () => {
  test.skip("[P0] validates the canonical pricing confirmation event fixture", async () => {
    // Given: Story 2.3 requires a producer-ready pricing.suggestion.accepted.v1 contract.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { pricingSuggestionAcceptedV1Schema } = await import(
      "@/shared/contracts/events/pricing-suggestion-accepted.v1"
    );

    // When: the canonical fixture is parsed by the event schema.
    const parsed = pricingSuggestionAcceptedV1Schema.parse(canonicalFixture);

    // Then: all required common fields and pricing payload fields are accepted.
    expect(parsed).toEqual(canonicalFixture);
  });

  test.skip("[P0] creates a deterministic eventId for identical confirmation inputs", async () => {
    const scenario = createPricingConfirmationScenario({
      clientRequestId: "client-deterministic-atdd",
      idempotencyKey: "idem-deterministic-atdd",
      traceId: "trace-deterministic-atdd",
      basisRevision: "basis-deterministic-atdd",
      suggestedPriceKrw: 1_240_000,
      editedPriceKrw: 1_180_000
    });

    // Given: the same recommendation, revision, confirmed price, and mode are retried.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { buildPricingSuggestionAcceptedV1 } = await import(
      "@/shared/contracts/events/pricing-suggestion-accepted.v1"
    );

    const input = {
      clientRequestId: scenario.clientRequestId,
      idempotencyKey: scenario.idempotencyKey,
      traceId: scenario.traceId,
      occurredAt: "2026-04-22T02:00:00.000Z",
      basisRevision: scenario.basisRevision,
      suggestedPriceKrw: scenario.suggestedPriceKrw,
      confirmedPriceKrw: scenario.editedPriceKrw,
      mode: "edited" as const,
      manualReason: scenario.manualReason
    };

    // When: the event helper is called twice with equivalent inputs.
    const first = buildPricingSuggestionAcceptedV1(input);
    const second = buildPricingSuggestionAcceptedV1(input);

    // Then: idempotent retries produce the same eventId and delta.
    expect(second.eventId).toBe(first.eventId);
    expect(first.payload.deltaKrw).toBe(-60_000);
    expect(first.payload.mode).toBe("edited");
  });

  test.skip("[P1] rejects a pricing event that drops idempotency or revision fields", async () => {
    // Given: an event without fields needed for duplicate-rate guardrails.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { pricingSuggestionAcceptedV1Schema } = await import(
      "@/shared/contracts/events/pricing-suggestion-accepted.v1"
    );

    const invalidEvent = {
      ...canonicalFixture,
      payload: {
        clientRequestId: canonicalFixture.payload.clientRequestId,
        confirmedPriceKrw: canonicalFixture.payload.confirmedPriceKrw,
        mode: canonicalFixture.payload.mode
      }
    };

    // When/Then: the schema rejects the incomplete producer event.
    expect(() => pricingSuggestionAcceptedV1Schema.parse(invalidEvent)).toThrow();
  });
});
