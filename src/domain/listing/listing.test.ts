import {
  createListingInputSchema,
  listingIdSchema,
  type CreateListingInput
} from "@/domain/listing/listing";

describe("createListingInputSchema", () => {
  it("parses a valid listing payload from unknown input", () => {
    const parsed = createListingInputSchema.parse({
      title: "  맥북 에어 M3  ",
      category: "  노트북 ",
      keySpecifications: [" 16GB RAM ", " 512GB SSD "],
      priceKrw: 1850000
    });

    expect(parsed).toEqual<CreateListingInput>({
      title: "맥북 에어 M3",
      category: "노트북",
      keySpecifications: ["16GB RAM", "512GB SSD"],
      priceKrw: 1850000
    });
  });

  it("rejects payloads without at least one key specification", () => {
    expect.assertions(2);

    try {
      createListingInputSchema.parse({
        title: "아이폰 15",
        category: "스마트폰",
        keySpecifications: [],
        priceKrw: 850000
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(`${error}`).toContain("핵심 스펙");
    }
  });
});

describe("listingIdSchema", () => {
  it("accepts uuid identifiers for detail routes", () => {
    const parsed = listingIdSchema.parse("6c57184a-e577-4e1f-9910-94ed9b75f315");

    expect(parsed).toBe("6c57184a-e577-4e1f-9910-94ed9b75f315");
  });
});
