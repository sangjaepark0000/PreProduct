import {
  autoAdjustRuleInputSchema,
  buildAutoAdjustRuleFormValues,
  toAutoAdjustRuleDisplayModel,
  validateAutoAdjustRuleInput,
  type AutoAdjustRule
} from "@/domain/pricing/auto-adjust-rule";

const listingId = "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b";

describe("autoAdjustRuleInputSchema", () => {
  it("accepts a valid listing-scoped rule and normalizes numeric strings", () => {
    const parsed = autoAdjustRuleInputSchema.parse({
      listingId,
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });

    expect(parsed).toEqual({
      listingId,
      periodDays: 14,
      discountRatePercent: 8,
      floorPriceKrw: 1_200_000
    });
  });

  it("rejects invalid period, discount, and floor boundaries", () => {
    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId,
        periodDays: "0",
        discountRatePercent: "8",
        floorPriceKrw: "1200000"
      })
    ).toThrow("주기는 1일 이상");

    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId,
        periodDays: "14",
        discountRatePercent: "101",
        floorPriceKrw: "1200000"
      })
    ).toThrow("인하율은 50% 이하");

    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId,
        periodDays: "14",
        discountRatePercent: "8",
        floorPriceKrw: "0"
      })
    ).toThrow("최저가 하한");
  });

  it("rejects unsafe floor combinations against the current listing price", () => {
    const result = validateAutoAdjustRuleInput(
      {
        listingId,
        periodDays: "14",
        discountRatePercent: "8",
        floorPriceKrw: "1850000"
      },
      {
        currentPriceKrw: 1_850_000
      }
    );

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.fieldErrors.floorPriceKrw).toContain(
      "현재 가격보다 낮아야"
    );
  });
});
describe("auto-adjust rule display helpers", () => {
  const activeRule: AutoAdjustRule = {
    listingId,
    periodDays: 14,
    discountRatePercent: 8,
    floorPriceKrw: 1_200_000,
    enabled: true,
    updatedAt: "2026-04-22T00:00:00.000Z"
  };

  it("builds form values from the last valid active rule", () => {
    expect(buildAutoAdjustRuleFormValues(activeRule)).toEqual({
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });
  });

  it("builds a seller-readable active rule summary", () => {
    expect(toAutoAdjustRuleDisplayModel(activeRule)).toMatchObject({
      summary: "14일마다 8% 인하, 최저 1,200,000원"
    });
  });
});
