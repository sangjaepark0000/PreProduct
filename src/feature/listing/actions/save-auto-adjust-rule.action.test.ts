import { RetryableAutoAdjustRuleSaveError } from "@/domain/pricing/auto-adjust-rule";
import {
  createInitialSaveAutoAdjustRuleFormState,
  handleSaveAutoAdjustRuleSubmission
} from "@/feature/listing/actions/save-auto-adjust-rule.action";

const listingId = "32b30d38-7fb0-4aa8-8ef4-ebfc558102da";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

const activeRule = {
  listingId,
  periodDays: 14,
  discountRatePercent: 8,
  floorPriceKrw: 1_200_000,
  enabled: true,
  updatedAt: "2026-04-22T00:00:00.000Z"
};

describe("handleSaveAutoAdjustRuleSubmission", () => {
  it("stores a valid rule and returns the active rule summary", async () => {
    const result = await handleSaveAutoAdjustRuleSubmission(
      {
        saveAutoAdjustRule: async (input) => ({
          ...input,
          enabled: true,
          updatedAt: "2026-04-22T00:05:00.000Z"
        })
      },
      listingId,
      1_850_000,
      createInitialSaveAutoAdjustRuleFormState(null),
      buildFormData({
        periodDays: "14",
        discountRatePercent: "8",
        floorPriceKrw: "1200000"
      })
    );

    expect(result.submissionStatus).toBe("success");
    expect(result.activeRule?.summary).toBe(
      "14일마다 8% 인하, 최저 1,200,000원"
    );
    expect(result.values).toEqual({
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });
  });

  it("keeps the last valid rule when invalid input is submitted", async () => {
    const result = await handleSaveAutoAdjustRuleSubmission(
      {
        saveAutoAdjustRule: async () => {
          throw new Error("should not be called");
        }
      },
      listingId,
      1_850_000,
      createInitialSaveAutoAdjustRuleFormState(activeRule),
      buildFormData({
        periodDays: "0",
        discountRatePercent: "101",
        floorPriceKrw: "0"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.formError).toContain("유효성 검증");
    expect(result.values).toEqual({
      periodDays: "14",
      discountRatePercent: "8",
      floorPriceKrw: "1200000"
    });
    expect(result.activeRule?.summary).toContain("14일마다 8% 인하");
    expect(result.errorFieldLabels).toEqual([
      "주기(일)",
      "인하율(%)",
      "최저가 하한 (원)"
    ]);
  });

  it("keeps attempted invalid values when no active rule exists yet", async () => {
    const result = await handleSaveAutoAdjustRuleSubmission(
      {
        saveAutoAdjustRule: async () => {
          throw new Error("should not be called");
        }
      },
      listingId,
      1_850_000,
      createInitialSaveAutoAdjustRuleFormState(null),
      buildFormData({
        periodDays: "0",
        discountRatePercent: "101",
        floorPriceKrw: "0"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.values).toEqual({
      periodDays: "0",
      discountRatePercent: "101",
      floorPriceKrw: "0"
    });
    expect(result.activeRule).toBeNull();
    expect(result.recoveryGuide).toContain(
      "1일 이상 365일 이하의 정수로 다시 입력해 주세요."
    );
  });

  it("keeps the last valid rule when persistence is retryable", async () => {
    const result = await handleSaveAutoAdjustRuleSubmission(
      {
        saveAutoAdjustRule: async () => {
          throw new RetryableAutoAdjustRuleSaveError("database offline");
        }
      },
      listingId,
      1_850_000,
      createInitialSaveAutoAdjustRuleFormState(activeRule),
      buildFormData({
        periodDays: "21",
        discountRatePercent: "5",
        floorPriceKrw: "1100000"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.formError).toContain("저장에 실패");
    expect(result.values.floorPriceKrw).toBe("1200000");
    expect(result.activeRule?.floorPriceKrw).toBe("1200000");
  });
});
