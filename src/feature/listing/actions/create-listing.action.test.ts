import { RetryableCreateListingError } from "@/domain/listing/listing.errors";
import {
  handleCreateListingSubmission,
  initialCreateListingFormState
} from "@/feature/listing/actions/create-listing.action";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("handleCreateListingSubmission", () => {
  it("submits manual fallback completion through the existing listing input shape", async () => {
    const createListing = jest.fn(async () => ({
      id: "0f8f90a0-c621-40db-a400-f77910367661"
    }));

    const result = await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildFormData({
        title: "수동 fallback 카메라",
        category: "카메라",
        keySpecificationsText: "바디 단품\n셔터 1200컷",
        priceKrw: "880000",
        status: "판매중"
      })
    );

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

  it("returns validation errors while preserving the submitted values", async () => {
    const result = await handleCreateListingSubmission(
      {
        createListing: async () => {
          throw new Error("should not be called");
        }
      },
      initialCreateListingFormState,
      buildFormData({
        title: "닌텐도 스위치 OLED",
        category: "게임기",
        keySpecificationsText: "",
        priceKrw: "420000",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected validation failure state");
    }

    expect(result.status).toBe("error");
    expect(result.values).toMatchObject({
      title: "닌텐도 스위치 OLED",
      category: "게임기",
      keySpecificationsText: "",
      priceKrw: "420000",
      status: "판매중"
    });
    expect(result.fieldErrors.keySpecificationsText).toBeDefined();
    expect(result.errorFieldLabels).toEqual(["핵심 스펙"]);
    expect(result.formError).toContain("핵심 스펙");
  });

  it("returns a recoverable form error when storage fails", async () => {
    const result = await handleCreateListingSubmission(
      {
        createListing: async () => {
          throw new RetryableCreateListingError("database offline");
        }
      },
      initialCreateListingFormState,
      buildFormData({
        title: "아이패드 미니",
        category: "태블릿",
        keySpecificationsText: "A17 Pro\n256GB",
        priceKrw: "700000",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected recoverable error state");
    }

    expect(result.status).toBe("error");
    expect(result.formError).toContain("저장");
    expect(result.values.keySpecificationsText).toBe("A17 Pro\n256GB");
    expect(result.values.status).toBe("판매중");
    expect(result.errorFieldLabels).toEqual([]);
  });

  it("returns the created listing id on success", async () => {
    const result = await handleCreateListingSubmission(
      {
        createListing: async () => ({
          id: "c18ee303-31c3-4bb6-9539-632d86da2ee8"
        })
      },
      initialCreateListingFormState,
      buildFormData({
        title: "플레이스테이션 5",
        category: "콘솔",
        keySpecificationsText: "디스크 에디션\n듀얼센스 포함",
        priceKrw: "520000",
        status: "프리리스팅"
      })
    );

    expect(result).toEqual({
      listingId: "c18ee303-31c3-4bb6-9539-632d86da2ee8",
      status: "success"
    });
  });

  it("rethrows unexpected runtime failures so the route error boundary can handle them", async () => {
    await expect(
      handleCreateListingSubmission(
        {
          createListing: async () => {
            throw new Error("unexpected invariant break");
          }
        },
        initialCreateListingFormState,
        buildFormData({
          title: "플레이스테이션 5",
          category: "콘솔",
          keySpecificationsText: "디스크 에디션\n듀얼센스 포함",
          priceKrw: "520000",
          status: "판매중"
        })
      )
    ).rejects.toThrow("unexpected invariant break");
  });

  it("reports multiple missing required fields with a recovery summary", async () => {
    const result = await handleCreateListingSubmission(
      {
        createListing: async () => {
          throw new Error("should not be called");
        }
      },
      initialCreateListingFormState,
      buildFormData({
        title: "",
        category: "",
        keySpecificationsText: "",
        priceKrw: "",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected validation failure state");
    }

    expect(result.fieldErrors).toMatchObject({
      title: "제목을 입력해 주세요.",
      category: "카테고리를 입력해 주세요.",
      keySpecificationsText: "핵심 스펙을 1개 이상 입력해 주세요.",
      priceKrw: "가격을 입력해 주세요."
    });
    expect(result.errorFieldLabels).toEqual(["제목", "카테고리", "핵심 스펙", "가격"]);
    expect(result.formError).toContain("제목, 카테고리, 핵심 스펙, 가격");
  });

  it("rejects non-numeric prices before touching persistence", async () => {
    const createListing = jest.fn();

    const result = await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildFormData({
        title: "에어팟 맥스",
        category: "헤드폰",
        keySpecificationsText: "라이트닝 케이블 포함",
        priceKrw: "12만원",
        status: "판매중"
      })
    );

    if (result.status === "success") {
      throw new Error("expected validation failure state");
    }

    expect(createListing).not.toHaveBeenCalled();
    expect(result.fieldErrors.priceKrw).toBe("가격은 숫자만 입력해 주세요.");
    expect(result.formError).toContain("가격");
  });
});
