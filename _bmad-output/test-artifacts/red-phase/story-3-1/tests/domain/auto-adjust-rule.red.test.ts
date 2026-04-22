describe("Story 3.1 auto-adjust rule domain contract (ATDD RED)", () => {
  test.skip("[P0] accepts a valid listing-scoped rule and normalizes its values", async () => {
    // Given: a valid rule payload for a single listing.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { autoAdjustRuleInputSchema } = await import(
      "@/domain/pricing/auto-adjust-rule"
    );

    const parsed = autoAdjustRuleInputSchema.parse({
      listingId: "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b",
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });

    expect(parsed).toEqual({
      listingId: "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b",
      periodDays: 14,
      discountRatePercent: 8,
      floorPriceKrw: 1_200_000
    });
  });

  test.skip("[P0] rejects a zero period with a field-specific recovery message", async () => {
    // Given: the period is not a positive integer day count.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { autoAdjustRuleInputSchema } = await import(
      "@/domain/pricing/auto-adjust-rule"
    );

    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId: "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b",
        periodDays: "0",
        discountRatePercent: "8",
        floorPriceKrw: "1200000"
      })
    ).toThrow();
  });

  test.skip("[P0] rejects discount and floor values outside the rule policy", async () => {
    // Given: the rule violates the pricing floor or discount percentage policy.
    // @ts-ignore -- ATDD red phase imports the target story module before implementation.
    const { autoAdjustRuleInputSchema } = await import(
      "@/domain/pricing/auto-adjust-rule"
    );

    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId: "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b",
        periodDays: "14",
        discountRatePercent: "101",
        floorPriceKrw: "1200000"
      })
    ).toThrow();

    expect(() =>
      autoAdjustRuleInputSchema.parse({
        listingId: "b9c0d2d8-20f8-4d2e-b4a8-84dba2be8e1b",
        periodDays: "14",
        discountRatePercent: "8",
        floorPriceKrw: "0"
      })
    ).toThrow();
  });
});
