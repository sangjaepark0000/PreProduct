import { ZodError } from "zod";

import { notFound } from "next/navigation";

import ListingDetailPage from "@/app/listings/[listingId]/page";
import { getListingById } from "@/domain/listing/listing.service";
import { getListingRepository } from "@/infra/listing/listing.repository";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  })
}));

jest.mock("@/domain/listing/listing.service", () => ({
  getListingById: jest.fn()
}));

jest.mock("@/infra/listing/listing.repository", () => ({
  getListingRepository: jest.fn(() => ({ mocked: true }))
}));

describe("ListingDetailPage", () => {
  const listingId = "32b30d38-7fb0-4aa8-8ef4-ebfc558102da";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("routes malformed listing ids to notFound before repository access", async () => {
    await expect(
      ListingDetailPage({
        params: Promise.resolve({
          listingId: "not-a-uuid"
        })
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getListingRepository).not.toHaveBeenCalled();
    expect(getListingById).not.toHaveBeenCalled();
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("routes missing listings to notFound", async () => {
    (getListingById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      ListingDetailPage({
        params: Promise.resolve({
          listingId
        })
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getListingRepository).toHaveBeenCalledTimes(1);
    expect(getListingById).toHaveBeenCalledWith(
      {
        listingRepository: {
          mocked: true
        }
      },
      listingId
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("rethrows repository failures instead of masking them as 404s", async () => {
    const databaseError = new Error("database offline");

    (getListingById as jest.Mock).mockRejectedValueOnce(databaseError);

    await expect(
      ListingDetailPage({
        params: Promise.resolve({
          listingId
        })
      })
    ).rejects.toThrow(databaseError);

    expect(notFound).not.toHaveBeenCalled();
  });

  it("rethrows schema drift errors instead of masking them as 404s", async () => {
    const schemaError = new ZodError([]);

    (getListingById as jest.Mock).mockRejectedValueOnce(schemaError);

    await expect(
      ListingDetailPage({
        params: Promise.resolve({
          listingId
        })
      })
    ).rejects.toBe(schemaError);

    expect(getListingRepository).toHaveBeenCalledTimes(1);
    expect(notFound).not.toHaveBeenCalled();
  });
});
