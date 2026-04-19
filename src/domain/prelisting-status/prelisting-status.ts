import { z } from "zod";

export const prelistingStatusValues = [
  "판매중",
  "프리리스팅"
] as const;

export const prelistingStatusSchema = z.enum(prelistingStatusValues);

export type PrelistingStatus = z.infer<typeof prelistingStatusSchema>;
