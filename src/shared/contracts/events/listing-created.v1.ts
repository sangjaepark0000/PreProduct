import { listingIdSchema } from "@/domain/listing/listing";
import { prelistingStatusSchema } from "@/domain/prelisting-status/prelisting-status";

import { z } from "zod";

export const listingCreatedV1Schema = z
  .object({
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    traceId: z.string().min(8),
    schemaVersion: z.literal("1.0.0"),
    payload: z
      .object({
        listingId: listingIdSchema,
        initialStatus: prelistingStatusSchema
      })
      .strict()
  })
  .strict();

export type ListingCreatedV1 = z.infer<typeof listingCreatedV1Schema>;
