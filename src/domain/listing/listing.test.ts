import {
  createListingInputSchema,
  listingIdSchema,
  listingSchema,
  type CreateListingInput
} from "@/domain/listing/listing";
import { prelistingStatusValues } from "@/domain/prelisting-status/prelisting-status";

describe("createListingInputSchema", () => {
  it("parses a valid listing payload from unknown input", () => {
    const parsed = createListingInputSchema.parse({
      title: "  맥북 에어 M3  ",
      category: "  노트북 ",
      keySpecifications: [" 16GB RAM ", " 512GB SSD "],
      priceKrw: 1850000,
      status: "판매중"
    });

    expect(parsed).toEqual<CreateListingInput>({
      title: "맥북 에어 M3",
      category: "노트북",
      keySpecifications: ["16GB RAM", "512GB SSD"],
      priceKrw: 1850000,
      status: "판매중"
    });
  });

  it("rejects missing title with a field-specific message", () => {
    expect(() =>
      createListingInputSchema.parse({
        title: "   ",
        category: "노트북",
        keySpecifications: ["16GB RAM"],
        priceKrw: 1850000,
        status: "판매중"
      })
    ).toThrow("제목을 입력해 주세요.");
  });

  it("rejects payloads without at least one key specification", () => {
    expect.assertions(2);

    try {
      createListingInputSchema.parse({
        title: "아이폰 15",
        category: "스마트폰",
        keySpecifications: [],
        priceKrw: 850000,
        status: "판매중"
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(`${error}`).toContain("핵심 스펙");
    }
  });

  it("accepts only the canonical Story 1.2 status values", () => {
    const parsed = createListingInputSchema.parse({
      title: "소니 A7C II",
      category: "카메라",
      keySpecifications: ["풀프레임"],
      priceKrw: 2100000,
      status: "프리리스팅"
    });

    expect(parsed.status).toBe("프리리스팅");
    expect(prelistingStatusValues).toEqual(["판매중", "프리리스팅"]);
  });
});

describe("listingIdSchema", () => {
  it("accepts uuid identifiers for detail routes", () => {
    const parsed = listingIdSchema.parse("6c57184a-e577-4e1f-9910-94ed9b75f315");

    expect(parsed).toBe("6c57184a-e577-4e1f-9910-94ed9b75f315");
  });
});

describe("listingSchema", () => {
  it("persists initialStatus and currentStatus in the canonical domain shape", () => {
    const parsed = listingSchema.parse({
      id: "6c57184a-e577-4e1f-9910-94ed9b75f315",
      title: "맥북 에어 M3",
      category: "노트북",
      keySpecifications: ["16GB RAM"],
      priceKrw: 1850000,
      initialStatus: "프리리스팅",
      currentStatus: "판매중",
      createdAt: "2026-04-19T00:00:00.000Z",
      updatedAt: "2026-04-19T00:01:00.000Z"
    });

    expect(parsed.initialStatus).toBe("프리리스팅");
    expect(parsed.currentStatus).toBe("판매중");
  });
});
