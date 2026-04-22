import {
  buildAiExtractionReviewedV1,
  deriveAiExtractionReviewedFields
} from "@/shared/contracts/events/ai-extraction-reviewed.v1";

const requestMeta = {
  clientRequestId: "client-req-story-2-2",
  idempotencyKey: "idem-story-2-2-draft-001",
  requestVersion: 2
} as const;

const draft = {
  title: "AI가 만든 제목",
  category: "노트북",
  keySpecifications: ["M3", "16GB RAM"],
  confidence: 0.82,
  fallbackRecommended: false
} as const;

const confirmedFields = {
  title: "사용자가 확정한 제목",
  category: "랩톱",
  keySpecifications: ["M3 Pro", "18GB RAM"]
} as const;

describe("ai.extraction.reviewed.v1 helpers", () => {
  it("derives accepted and edited fields from draft and confirmed fields", () => {
    expect(
      deriveAiExtractionReviewedFields({
        draft,
        confirmedFields
      })
    ).toEqual({
      acceptedFields: ["confidence", "fallbackRecommended"],
      editedFields: ["title", "category", "keySpecifications"]
    });
  });

  it("keeps a deterministic eventId for the same confirmation input", () => {
    const input = {
      ...requestMeta,
      traceId: "trace-story-2-2-reviewed",
      occurredAt: "2026-04-22T09:00:00.000Z",
      draft,
      confirmedFields
    };

    const firstEvent = buildAiExtractionReviewedV1(input);
    const duplicateEvent = buildAiExtractionReviewedV1(input);

    expect(duplicateEvent.eventId).toBe(firstEvent.eventId);
    expect(firstEvent).toMatchObject({
      eventId: "4b777a9d-30e8-5700-8905-868509c98d4f",
      payload: {
        confidence: 0.82,
        fallbackRecommended: false
      }
    });
  });
});
