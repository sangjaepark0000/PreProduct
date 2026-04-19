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
});
