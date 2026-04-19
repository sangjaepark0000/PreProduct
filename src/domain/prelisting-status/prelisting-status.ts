import { z } from "zod";

export const prelistingStatusValues = [
  "draft",
  "ready_for_review",
  "needs_input"
] as const;

export const prelistingStatusSchema = z.enum(prelistingStatusValues);

export type PrelistingStatus = z.infer<typeof prelistingStatusSchema>;
