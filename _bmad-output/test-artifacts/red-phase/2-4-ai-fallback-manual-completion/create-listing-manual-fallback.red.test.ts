import {
  handleCreateListingSubmission,
  initialCreateListingFormState
} from "../../../../src/feature/listing/actions/create-listing.action";
import { RetryableCreateListingError } from "../../../../src/domain/listing/listing.errors";

function buildManualFallbackFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("Story 2.4 red-phase manual fallback createListing contract", () => {
  test.skip("[P0] submits fallback completion through the existing createListing server action keys", async () => {
    const createListing = jest.fn(async () => ({
      id: "0f8f90a0-c621-40db-a400-f77910367661"
    }));

    const result = await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildManualFallbackFormData({
        title: "수동 fallback 카메라",
        category: "카메라",
        keySpecificationsText: "바디 단품\n셔터 1200컷",
        priceKrw: "880000",
        status: "판매중"
      })
    );

    expect(createListing).toHaveBeenCalledTimes(1);
    expect(createListing).toHaveBeenCalledWith({
      title: "수동 fallback 카메라",
      category: "카메라",
      keySpecifications: ["바디 단품", "셔터 1200컷"],
      priceKrw: 880000,
      status: "판매중",
      initialStatus: "판매중",
      currentStatus: "판매중"
    });
    expect(result).toEqual({
      status: "success",
      listingId: "0f8f90a0-c621-40db-a400-f77910367661"
    });
  });

  test.skip("[P1] preserves fallback-entered values when required fields fail validation", async () => {
    const createListing = jest.fn();

    const result = await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildManualFallbackFormData({
        title: "수동 fallback 카메라",
        category: "카메라",
        keySpecificationsText: "",
        priceKrw: "",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected fallback validation failure state");
    }

    expect(createListing).not.toHaveBeenCalled();
    expect(result.values).toMatchObject({
      title: "수동 fallback 카메라",
      category: "카메라",
      keySpecificationsText: "",
      priceKrw: "",
      status: "판매중"
    });
    expect(result.fieldErrors).toMatchObject({
      keySpecificationsText: "핵심 스펙을 1개 이상 입력해 주세요.",
      priceKrw: "가격을 입력해 주세요."
    });
    expect(result.errorFieldLabels).toEqual(["핵심 스펙", "가격"]);
    expect(result.formError).toContain("핵심 스펙, 가격");
  });

  test.skip("[P1] preserves fallback inputs on retryable persistence failure", async () => {
    const result = await handleCreateListingSubmission(
      {
        createListing: async () => {
          throw new RetryableCreateListingError("database unavailable");
        }
      },
      initialCreateListingFormState,
      buildManualFallbackFormData({
        title: "수동 fallback 저장 실패",
        category: "카메라",
        keySpecificationsText: "바디 단품",
        priceKrw: "880000",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected retryable failure state");
    }

    expect(result.values).toMatchObject({
      title: "수동 fallback 저장 실패",
      category: "카메라",
      keySpecificationsText: "바디 단품",
      priceKrw: "880000",
      status: "판매중"
    });
    expect(result.formError).toBe(
      "저장에 실패했습니다. 입력 내용은 유지됐으니 다시 시도해 주세요."
    );
    expect(result.errorFieldLabels).toEqual([]);
  });
});
