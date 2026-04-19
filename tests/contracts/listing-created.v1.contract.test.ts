import fixture from "./fixtures/listing.created.v1.json";
import { listingCreatedV1Schema } from "@/shared/contracts/events/listing-created.v1";

describe("listing.created.v1 contract", () => {
  it("accepts the canonical fixture", () => {
    expect(listingCreatedV1Schema.parse(fixture)).toEqual(fixture);
  });

  it("rejects a breaking payload change", () => {
    expect(() =>
      listingCreatedV1Schema.parse({
        ...fixture,
        payload: {
          listingId: fixture.payload.listingId
        }
      })
    ).toThrow();
  });
});
