import {
  createListingInputSchema,
  listingIdSchema,
  listingSchema,
  type CreateListingInput,
  type Listing,
  type ListingId,
  updateListingStatusInputSchema,
  type UpdateListingStatusInput
} from "@/domain/listing/listing";

export type ListingRepository = {
  create: (listing: Listing) => Promise<Listing>;
  findById: (listingId: ListingId) => Promise<Listing | null>;
  updateStatus: (
    listingId: ListingId,
    status: Listing["currentStatus"]
  ) => Promise<Listing | null>;
};

type ListingServiceDependencies = {
  listingRepository: ListingRepository;
};

export async function createListing(
  { listingRepository }: ListingServiceDependencies,
  rawInput: unknown
): Promise<Listing> {
  const input = createListingInputSchema.parse(rawInput);
  const timestamp = new Date().toISOString();

  const listing = listingSchema.parse({
    id: crypto.randomUUID(),
    title: input.title,
    category: input.category,
    keySpecifications: input.keySpecifications,
    priceKrw: input.priceKrw,
    initialStatus: input.status,
    currentStatus: input.status,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return listingRepository.create(listing);
}

export async function getListingById(
  { listingRepository }: ListingServiceDependencies,
  rawListingId: string
): Promise<Listing | null> {
  const listingId = listingIdSchema.parse(rawListingId);

  return listingRepository.findById(listingId);
}

export async function updateListingStatus(
  { listingRepository }: ListingServiceDependencies,
  rawInput: unknown
): Promise<Listing | null> {
  const input = updateListingStatusInputSchema.parse(rawInput);

  return listingRepository.updateStatus(input.listingId, input.status);
}

export type { CreateListingInput, Listing, UpdateListingStatusInput };
