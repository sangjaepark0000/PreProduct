import fixture from "./fixtures/pricing.auto-adjust.minimal-signal.v1.json";

import { pricingAutoAdjustMinimalSignalV1Schema } from "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1";

describe("pricing.auto_adjust minimal signal v1 contract", () => {
  it("accepts the canonical minimal signal fixture", () => {
    expect(pricingAutoAdjustMinimalSignalV1Schema.parse(fixture)).toEqual(
      fixture
    );
    expect(Object.keys(fixture).sort()).toEqual([
      "listingId",
      "reasonCode",
      "updatedAt"
    ]);
  });

  it("rejects extra mutable price fields", () => {
    expect(() =>
      pricingAutoAdjustMinimalSignalV1Schema.parse({
        ...fixture,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000
      })
    ).toThrow();
  });

  it("rejects applied history timestamps that are not part of the signal contract", () => {
    expect(() =>
      pricingAutoAdjustMinimalSignalV1Schema.parse({
        ...fixture,
        appliedAt: fixture.updatedAt
      })
    ).toThrow();
  });
});
