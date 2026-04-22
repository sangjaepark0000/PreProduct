import {
  buildMinimalSignalFromPriceChange,
  buildPriceChangeHistoryRow,
  type AppliedPriceChangeSource
} from "@/domain/pricing/price-change-history";

const appliedSource = {
  listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
  beforePriceKrw: 1_850_000,
  afterPriceKrw: 1_702_000,
  appliedAt: "2026-04-22T02:00:00.000Z",
  reasonCode: "due-rule-applied" as const
};

describe("price change history projection", () => {
  it("builds a stable history row from the applied adjustment source", () => {
    expect(buildPriceChangeHistoryRow(appliedSource)).toEqual(appliedSource);
  });

  it("derives the minimal signal from the same applied adjustment timestamp and reason", () => {
    const signal = buildMinimalSignalFromPriceChange(appliedSource);

    expect(signal).toEqual({
      listingId: appliedSource.listingId,
      updatedAt: appliedSource.appliedAt,
      reasonCode: appliedSource.reasonCode
    });
    expect(Object.keys(signal).sort()).toEqual([
      "listingId",
      "reasonCode",
      "updatedAt"
    ]);
  });

  it("rejects unknown price-change reasons before rendering history", () => {
    const invalidSource = {
      ...appliedSource,
      reasonCode: "manual-price-edit"
    } as unknown as AppliedPriceChangeSource;

    expect(() =>
      buildPriceChangeHistoryRow(invalidSource)
    ).toThrow();
  });
});
