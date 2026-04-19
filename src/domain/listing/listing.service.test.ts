import {
  createListing,
  getListingById,
  type ListingRepository
} from "@/domain/listing/listing.service";

describe("listing.service", () => {
  it("persists a new listing through the repository boundary", async () => {
    expect.assertions(2);

    const savedRecords: Array<Parameters<ListingRepository["create"]>[0]> = [];
    const repository: ListingRepository = {
      create: async (record) => {
        savedRecords.push(record);

        return record;
      },
      findById: async () => null
    };

    const listing = await createListing(
      { listingRepository: repository },
      {
        title: "캐논 EOS R50",
        category: "카메라",
        keySpecifications: ["24MP", "18-45mm 킷렌즈"],
        priceKrw: 930000
      }
    );

    expect(savedRecords[0]).toMatchObject({
      title: "캐논 EOS R50",
      category: "카메라",
      keySpecifications: ["24MP", "18-45mm 킷렌즈"],
      priceKrw: 930000
    });
    expect(listing.id).toEqual(savedRecords[0]?.id);
  });

  it("returns null for a missing listing id", async () => {
    const repository: ListingRepository = {
      create: async (record) => record,
      findById: async () => null
    };

    await expect(
      getListingById(
        { listingRepository: repository },
        "32b30d38-7fb0-4aa8-8ef4-ebfc558102da"
      )
    ).resolves.toBeNull();
  });
});
