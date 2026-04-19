import { type Listing } from "@/domain/listing/listing";
import { prelistingStatusValues } from "@/domain/prelisting-status/prelisting-status";
import {
  listingCreatedV1Schema,
  type ListingCreatedV1
} from "@/shared/contracts/events/listing-created.v1";

import { z } from "zod";

export const listingObservabilitySummarySchema = z.object({
  totalListings: z.number().int().nonnegative(),
  initialStatusDistribution: z.object({
    판매중: z.number().int().nonnegative(),
    프리리스팅: z.number().int().nonnegative()
  }),
  updatedWithin7DaysCount: z.number().int().nonnegative()
});

export const listingObservabilityReportSchema = z.object({
  summary: listingObservabilitySummarySchema,
  createdRecords: z.array(listingCreatedV1Schema)
});

export type ListingObservabilitySummary = z.infer<
  typeof listingObservabilitySummarySchema
>;
export type ListingObservabilityReport = z.infer<
  typeof listingObservabilityReportSchema
>;

export function toListingCreatedRecord(listing: Listing): ListingCreatedV1 {
  return listingCreatedV1Schema.parse({
    eventId: listing.id,
    occurredAt: listing.createdAt,
    traceId: `listing-${listing.id}`,
    schemaVersion: "1.0.0",
    payload: {
      listingId: listing.id,
      initialStatus: listing.initialStatus
    }
  });
}

export function wasUpdatedWithin7Days(listing: Listing): boolean {
  const createdAt = new Date(listing.createdAt);
  const updatedAt = new Date(listing.updatedAt);

  if (updatedAt.getTime() <= createdAt.getTime()) {
    return false;
  }

  const sevenDaysAfterCreate = new Date(createdAt);

  sevenDaysAfterCreate.setUTCDate(sevenDaysAfterCreate.getUTCDate() + 7);

  return updatedAt.getTime() <= sevenDaysAfterCreate.getTime();
}

export function createEmptyInitialStatusDistribution(): Record<
  (typeof prelistingStatusValues)[number],
  number
> {
  return {
    판매중: 0,
    프리리스팅: 0
  };
}
