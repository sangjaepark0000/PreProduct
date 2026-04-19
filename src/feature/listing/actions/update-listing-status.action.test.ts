import { RetryableUpdateListingStatusError } from "@/domain/listing/listing.errors";
import {
  createInitialUpdateListingStatusFormState,
  handleUpdateListingStatusSubmission
} from "@/feature/listing/actions/update-listing-status.action";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("handleUpdateListingStatusSubmission", () => {
  it("updates the selected status and refreshes updatedAt on success", async () => {
    const result = await handleUpdateListingStatusSubmission(
      {
        updateListingStatus: async () => ({
          currentStatus: "판매중",
          updatedAt: "2026-04-19T00:05:00.000Z"
        })
      },
      "32b30d38-7fb0-4aa8-8ef4-ebfc558102da",
      createInitialUpdateListingStatusFormState({
        currentStatus: "프리리스팅",
        updatedAt: "2026-04-19T00:00:00.000Z"
      }),
      buildFormData({
        status: "판매중"
      })
    );

    expect(result).toMatchObject({
      submissionStatus: "success",
      currentStatus: "판매중",
      updatedAt: "2026-04-19T00:05:00.000Z"
    });
  });

  it("returns a recoverable error when the listing no longer exists", async () => {
    const result = await handleUpdateListingStatusSubmission(
      {
        updateListingStatus: async () => null
      },
      "32b30d38-7fb0-4aa8-8ef4-ebfc558102da",
      createInitialUpdateListingStatusFormState({
        currentStatus: "프리리스팅",
        updatedAt: "2026-04-19T00:00:00.000Z"
      }),
      buildFormData({
        status: "판매중"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.formError).toContain("다시 불러온");
    expect(result.currentStatus).toBe("프리리스팅");
  });

  it("returns field validation errors for unsupported status values", async () => {
    const result = await handleUpdateListingStatusSubmission(
      {
        updateListingStatus: async () => {
          throw new Error("should not be called");
        }
      },
      "32b30d38-7fb0-4aa8-8ef4-ebfc558102da",
      createInitialUpdateListingStatusFormState({
        currentStatus: "프리리스팅",
        updatedAt: "2026-04-19T00:00:00.000Z"
      }),
      buildFormData({
        status: "임시보관"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.fieldErrors.status).toBeDefined();
  });

  it("returns a recoverable error when persistence fails", async () => {
    const result = await handleUpdateListingStatusSubmission(
      {
        updateListingStatus: async () => {
          throw new RetryableUpdateListingStatusError("database offline");
        }
      },
      "32b30d38-7fb0-4aa8-8ef4-ebfc558102da",
      createInitialUpdateListingStatusFormState({
        currentStatus: "프리리스팅",
        updatedAt: "2026-04-19T00:00:00.000Z"
      }),
      buildFormData({
        status: "판매중"
      })
    );

    expect(result.submissionStatus).toBe("error");
    expect(result.formError).toContain("상태 저장");
    expect(result.updatedAt).toBe("2026-04-19T00:00:00.000Z");
  });
});
