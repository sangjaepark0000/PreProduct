import { type ListingRepository } from "@/domain/listing/listing.service";
import {
  createEmptyInitialStatusDistribution,
  listingObservabilityReportSchema,
  toListingCreatedRecord,
  wasUpdatedWithin7Days,
  type ListingObservabilityReport
} from "@/domain/observability/listing-observability";

type ListingObservabilityDependencies = {
  listingRepository: Pick<ListingRepository, "listAll">;
};

export async function getListingObservabilityReport(
  { listingRepository }: ListingObservabilityDependencies
): Promise<ListingObservabilityReport> {
  const listings = await listingRepository.listAll();
  const initialStatusDistribution = createEmptyInitialStatusDistribution();

  listings.forEach((listing) => {
    initialStatusDistribution[listing.initialStatus] += 1;
  });

  return listingObservabilityReportSchema.parse({
    summary: {
      totalListings: listings.length,
      initialStatusDistribution,
      updatedWithin7DaysCount: listings.filter(wasUpdatedWithin7Days).length
    },
    createdRecords: listings.map(toListingCreatedRecord)
  });
}
