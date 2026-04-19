import { prelistingStatusSchema } from "@/domain/prelisting-status/prelisting-status";

import { z } from "zod";

export const listingIdSchema = z.uuid();

export type ListingId = z.infer<typeof listingIdSchema>;

const requiredTextSchema = z
  .string()
  .trim()
  .min(1, "필수 값을 입력해 주세요.");

export const createListingInputSchema = z.object({
  title: requiredTextSchema,
  category: requiredTextSchema,
  keySpecifications: z
    .array(requiredTextSchema)
    .min(1, "핵심 스펙을 1개 이상 입력해 주세요."),
  priceKrw: z.coerce.number().int().positive("가격은 1원 이상이어야 합니다."),
  status: prelistingStatusSchema
});

export const updateListingStatusInputSchema = z.object({
  listingId: listingIdSchema,
  status: prelistingStatusSchema
});

export const listingSchema = z.object({
  id: listingIdSchema,
  title: requiredTextSchema,
  category: requiredTextSchema,
  keySpecifications: z
    .array(requiredTextSchema)
    .min(1, "핵심 스펙을 1개 이상 입력해 주세요."),
  priceKrw: z.number().int().positive(),
  initialStatus: prelistingStatusSchema,
  currentStatus: prelistingStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type CreateListingInput = z.infer<typeof createListingInputSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusInputSchema>;
export type Listing = z.infer<typeof listingSchema>;
