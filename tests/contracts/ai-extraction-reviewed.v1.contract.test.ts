import fixture from "./fixtures/ai.extraction.reviewed.v1.json";
import { aiExtractionReviewedV1Schema } from "@/shared/contracts/events/ai-extraction-reviewed.v1";

describe("ai.extraction.reviewed.v1 contract", () => {
  it("accepts the canonical fixture", () => {
    expect(aiExtractionReviewedV1Schema.parse(fixture)).toEqual(fixture);
  });

  it("rejects a breaking payload change", () => {
    expect(() =>
      aiExtractionReviewedV1Schema.parse({
        ...fixture,
        payload: {
          clientRequestId: fixture.payload.clientRequestId
        }
      })
    ).toThrow();
  });
});
