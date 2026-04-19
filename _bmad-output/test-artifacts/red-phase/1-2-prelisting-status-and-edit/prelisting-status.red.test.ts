import {
  createListingInputSchema,
  listingSchema
} from "@/domain/listing/listing";
import {
  prelistingStatusSchema,
  prelistingStatusValues
} from "@/domain/prelisting-status/prelisting-status";

describe("Story 1.2 red-phase domain contracts", () => {
  it("limits the canonical status taxonomy to 판매중 and 프리리스팅", () => {
    expect(prelistingStatusValues).toEqual(["판매중", "프리리스팅"]);
    expect(prelistingStatusSchema.parse("판매중")).toBe("판매중");
    expect(prelistingStatusSchema.parse("프리리스팅")).toBe("프리리스팅");
  });

  it("extends createListingInputSchema with a user-selected status field", () => {
    expect(Object.keys(createListingInputSchema.shape)).toEqual(
      expect.arrayContaining(["status"])
    );
  });

  it("extends listingSchema with persisted initial/current status fields", () => {
    expect(Object.keys(listingSchema.shape)).toEqual(
      expect.arrayContaining(["initialStatus", "currentStatus"])
    );
  });
});
