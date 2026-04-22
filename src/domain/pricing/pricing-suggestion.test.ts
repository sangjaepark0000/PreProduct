import {
  buildPricingSuggestion,
  buildPricingSuggestionBasis,
  pricingPolicy,
  validatePriceInput
} from "@/domain/pricing/pricing-suggestion";
import { createListingInputSchema } from "@/domain/listing/listing";

describe("pricing suggestion helper", () => {
  it("creates a deterministic suggestion with a basis revision", () => {
    const basis = buildPricingSuggestionBasis({
      title: "맥북 프로 M3",
      category: "노트북",
      keySpecificationsText: "M3 Pro\n18GB RAM\n512GB SSD"
    });

    const suggestion = buildPricingSuggestion(basis);

    expect(suggestion).toMatchObject({
      suggestedPriceKrw: 1_240_000,
      basis: {
        basisRevision: basis.basisRevision
      }
    });
    expect(basis.basisRevision).toMatch(/^basis-[0-9a-f]{16}$/u);
  });

  it("keeps client price policy at least as strict as listing creation", () => {
    expect(validatePriceInput("0").ok).toBe(false);
    expect(validatePriceInput("100000000").ok).toBe(false);
    expect(validatePriceInput("1234").ok).toBe(false);
    expect(validatePriceInput("1240000")).toEqual({
      ok: true,
      priceKrw: 1_240_000
    });
    expect(() =>
      createListingInputSchema.parse({
        title: "맥북 프로 M3",
        category: "노트북",
        keySpecifications: ["M3 Pro"],
        priceKrw: pricingPolicy.maxPriceKrw + 1,
        status: "판매중"
      })
    ).toThrow();
  });
});
