export const story22RequestMeta = {
  clientRequestId: "client-req-story-2-2",
  idempotencyKey: "idem-story-2-2-draft-001",
  requestVersion: 2
} as const;

export const story22AiDraft = {
  title: "AI가 만든 제목",
  category: "노트북",
  keySpecifications: ["M3", "16GB RAM"],
  confidence: 0.82,
  fallbackRecommended: false
} as const;

export const story22ConfirmedFields = {
  title: "사용자가 확정한 제목",
  category: "랩톱",
  keySpecifications: ["M3 Pro", "18GB RAM"]
} as const;

export const canonicalReviewedEventFixture = {
  eventId: "8e6506e5-e51b-5c2e-99bb-6ecf7b4c9d3b",
  occurredAt: "2026-04-22T09:00:00.000Z",
  traceId: "trace-story-2-2-reviewed",
  schemaVersion: "1.0.0",
  payload: {
    clientRequestId: story22RequestMeta.clientRequestId,
    idempotencyKey: story22RequestMeta.idempotencyKey,
    requestVersion: story22RequestMeta.requestVersion,
    acceptedFields: ["confidence", "fallbackRecommended"],
    editedFields: ["title", "category", "keySpecifications"],
    confidence: story22AiDraft.confidence,
    fallbackRecommended: story22AiDraft.fallbackRecommended
  }
} as const;
