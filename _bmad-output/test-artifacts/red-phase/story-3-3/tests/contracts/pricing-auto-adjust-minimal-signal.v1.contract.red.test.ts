import canonicalFixture from "./fixtures/pricing.auto-adjust.minimal-signal.v1.json";

describe("Story 3.3 pricing.auto_adjust minimal signal contract (ATDD RED)", () => {
  test.skip("[P0] accepts the canonical minimal signal record", async () => {
    // Given: the minimal signal contract used for FR32 storage.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { pricingAutoAdjustMinimalSignalV1Schema } = await import(
      "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1"
    );

    // When: the canonical fixture is parsed by the signal schema.
    const parsed = pricingAutoAdjustMinimalSignalV1Schema.parse(canonicalFixture);

    // Then: the contract accepts the minimal record unchanged.
    expect(parsed).toEqual(canonicalFixture);
  });

  test.skip("[P0] rejects extra mutable price fields from the minimal signal", async () => {
    // Given: a signal payload that tries to carry full pricing history fields.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { pricingAutoAdjustMinimalSignalV1Schema } = await import(
      "@/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1"
    );

    // When/Then: the schema rejects any extra mutable price snapshot fields.
    expect(() =>
      pricingAutoAdjustMinimalSignalV1Schema.parse({
        ...canonicalFixture,
        beforePriceKrw: 1_850_000,
        afterPriceKrw: 1_702_000
      })
    ).toThrow();
  });
});