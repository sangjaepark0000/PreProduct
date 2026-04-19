import {
  createListing,
  getListingById,
  updateListingStatus,
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
      findById: async () => null,
      updateStatus: async () => null
    };

    const listing = await createListing(
      { listingRepository: repository },
      {
        title: "캐논 EOS R50",
        category: "카메라",
        keySpecifications: ["24MP", "18-45mm 킷렌즈"],
        priceKrw: 930000,
        status: "프리리스팅"
      }
    );

    expect(savedRecords[0]).toMatchObject({
      title: "캐논 EOS R50",
      category: "카메라",
      keySpecifications: ["24MP", "18-45mm 킷렌즈"],
      priceKrw: 930000,
      initialStatus: "프리리스팅",
      currentStatus: "프리리스팅"
    });
    expect(listing.id).toEqual(savedRecords[0]?.id);
  });

  it("returns null for a missing listing id", async () => {
    const repository: ListingRepository = {
      create: async (record) => record,
      findById: async () => null,
      updateStatus: async () => null
    };

    await expect(
      getListingById(
        { listingRepository: repository },
        "32b30d38-7fb0-4aa8-8ef4-ebfc558102da"
      )
    ).resolves.toBeNull();
  });

  it("updates the current status through the repository boundary", async () => {
    const repository: ListingRepository = {
      create: async (record) => record,
      findById: async () => null,
      updateStatus: async (listingId, status) => ({
        id: listingId,
        title: "캐논 EOS R50",
        category: "카메라",
        keySpecifications: ["24MP", "18-45mm 킷렌즈"],
        priceKrw: 930000,
        initialStatus: "프리리스팅",
        currentStatus: status,
        createdAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T00:05:00.000Z"
      })
    };

    await expect(
      updateListingStatus(
        { listingRepository: repository },
        {
          listingId: "32b30d38-7fb0-4aa8-8ef4-ebfc558102da",
          status: "판매중"
        }
      )
    ).resolves.toMatchObject({
      currentStatus: "판매중",
      updatedAt: "2026-04-19T00:05:00.000Z"
    });
  });
});
