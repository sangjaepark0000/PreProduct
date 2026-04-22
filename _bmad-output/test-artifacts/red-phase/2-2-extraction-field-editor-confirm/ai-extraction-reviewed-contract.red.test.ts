import {
  canonicalReviewedEventFixture,
  story22AiDraft,
  story22ConfirmedFields,
  story22RequestMeta
} from "./extraction-field-editor-test-data";

describe("Story 2.2 red-phase AI extraction reviewed contract", () => {
  test.skip("[P0] accepts the canonical ai.extraction.reviewed.v1 event fixture", async () => {
    // @ts-expect-error RED phase: Story 2.2 must add this event contract module.
    const { aiExtractionReviewedV1Schema } = await import(
      "@/shared/contracts/events/ai-extraction-reviewed.v1"
    );

    expect(aiExtractionReviewedV1Schema.parse(canonicalReviewedEventFixture)).toEqual(
      canonicalReviewedEventFixture
    );
  });

  test.skip("[P0] derives accepted and edited fields from draft versus confirmed values", async () => {
    // @ts-expect-error RED phase: Story 2.2 must add this producer-ready helper.
    const { buildAiExtractionReviewedV1 } = await import(
      "@/shared/contracts/events/ai-extraction-reviewed.v1"
    );

    const event = await buildAiExtractionReviewedV1({
      ...story22RequestMeta,
      traceId: "trace-story-2-2-reviewed",
      occurredAt: "2026-04-22T09:00:00.000Z",
      draft: story22AiDraft,
      confirmedFields: story22ConfirmedFields
    });

    expect(event.payload.acceptedFields).toEqual([
      "confidence",
      "fallbackRecommended"
    ]);
    expect(event.payload.editedFields).toEqual([
      "title",
      "category",
      "keySpecifications"
    ]);
    expect(event.payload.confidence).toBe(0.82);
    expect(event.payload.fallbackRecommended).toBe(false);
  });

  test.skip("[P0] keeps one deterministic eventId for the same draft confirmation", async () => {
    // @ts-expect-error RED phase: Story 2.2 must add deterministic event id generation.
    const { buildAiExtractionReviewedV1 } = await import(
      "@/shared/contracts/events/ai-extraction-reviewed.v1"
    );

    const input = {
      ...story22RequestMeta,
      traceId: "trace-story-2-2-reviewed",
      occurredAt: "2026-04-22T09:00:00.000Z",
      draft: story22AiDraft,
      confirmedFields: story22ConfirmedFields
    };

    const firstEvent = await buildAiExtractionReviewedV1(input);
    const duplicateEvent = await buildAiExtractionReviewedV1(input);

    expect(duplicateEvent.eventId).toBe(firstEvent.eventId);
    expect(firstEvent.eventId).toBe(canonicalReviewedEventFixture.eventId);
  });
});
