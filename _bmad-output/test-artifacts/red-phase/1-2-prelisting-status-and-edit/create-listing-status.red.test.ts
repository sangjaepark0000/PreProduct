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

describe("Story 1.2 red-phase create listing action", () => {
  it("passes the selected 프리리스팅 status through the domain boundary", async () => {
    const createListing = jest.fn().mockResolvedValue({
      id: "1e72562f-31a0-4b6a-804d-ae771dd30b53"
    });

    await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildFormData({
        title: "소니 A7C II",
        category: "카메라",
        keySpecificationsText: "풀프레임\n컷수 1200",
        priceKrw: "2100000",
        status: "프리리스팅"
      })
    );

    expect(createListing).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "프리리스팅",
        initialStatus: "프리리스팅",
        currentStatus: "프리리스팅"
      })
    );
  });

  it("rejects unsupported status values before touching persistence", async () => {
    const createListing = jest.fn();

    const result = await handleCreateListingSubmission(
      {
        createListing
      },
      initialCreateListingFormState,
      buildFormData({
        title: "소니 A7C II",
        category: "카메라",
        keySpecificationsText: "풀프레임\n컷수 1200",
        priceKrw: "2100000",
        status: "임시보관"
      })
    );

    expect(createListing).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: "error"
    });
  });
});
