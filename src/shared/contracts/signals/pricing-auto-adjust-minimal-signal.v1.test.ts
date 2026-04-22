import {
  buildPricingAutoAdjustMinimalSignalV1,
  pricingAutoAdjustMinimalSignalV1Schema
} from "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1";

const canonicalSignal = {
  listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
  updatedAt: "2026-04-22T02:00:00.000Z",
  reasonCode: "due-rule-applied" as const
};

describe("pricingAutoAdjustMinimalSignalV1Schema", () => {
  it("accepts the minimal signal fields required for later expansion", () => {
    expect(pricingAutoAdjustMinimalSignalV1Schema.parse(canonicalSignal)).toEqual(
      canonicalSignal
    );
    expect(buildPricingAutoAdjustMinimalSignalV1(canonicalSignal)).toEqual(
      canonicalSignal
    );
    expect(Object.keys(canonicalSignal).sort()).toEqual([
      "listingId",
      "reasonCode",
      "updatedAt"
    ]);
  });

  it("rejects mutable price snapshot fields", () => {
    expect(() =>
      pricingAutoAdjustMinimalSignalV1Schema.parse({
        ...canonicalSignal,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000
      })
    ).toThrow();
  });

  it("rejects full history-row fields that belong outside the minimal signal", () => {
    expect(() =>
      pricingAutoAdjustMinimalSignalV1Schema.parse({
        ...canonicalSignal,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000,
        appliedAt: canonicalSignal.updatedAt
      })
    ).toThrow();
  });
});
