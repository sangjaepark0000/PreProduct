import { z } from "zod";

export const aiExtractionAllowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export const aiExtractionMaxFileBytes = 10 * 1024 * 1024;

export const aiExtractionStatusValues = [
  "idle",
  "validating",
  "requesting",
  "success",
  "error",
  "fallback"
] as const;

export const aiExtractionErrorCodeValues = [
  "INVALID_FILE_TYPE",
  "FILE_TOO_LARGE",
  "CORRUPTED_IMAGE",
  "AI_TIMEOUT",
  "AI_UNAVAILABLE",
  "DUPLICATE_REQUEST",
  "INVALID_REQUEST"
] as const;

export const aiExtractionRequestSchema = z.object({
  clientRequestId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  requestVersion: z.coerce.number().int().positive()
});

export const aiExtractionDraftSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  keySpecifications: z.array(z.string().min(1)),
  confidence: z.number().min(0).max(1),
  fallbackRecommended: z.boolean()
});

export const aiExtractionConfirmedFieldsSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  keySpecifications: z.array(z.string().min(1)).min(1)
});

export const aiExtractionReviewInputSchema = z.object({
  clientRequestId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  requestVersion: z.number().int().positive(),
  draft: aiExtractionDraftSchema,
  confirmedFields: aiExtractionConfirmedFieldsSchema
});

export const aiExtractionResultSchema = z.object({
  status: z.enum(aiExtractionStatusValues),
  clientRequestId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  requestVersion: z.number().int().positive(),
  draft: aiExtractionDraftSchema
});

export const aiExtractionSuccessEnvelopeSchema = z.object({
  data: aiExtractionResultSchema,
  meta: z.object({
    requestId: z.string().min(1),
    duplicate: z.boolean().optional()
  })
});

export const aiExtractionErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.enum(aiExtractionErrorCodeValues),
    message: z.string().min(1),
    details: z
      .object({
        recoveryGuide: z.string().optional(),
        retryable: z.boolean().optional(),
        maxBytes: z.number().int().positive().optional()
      })
      .optional(),
    requestId: z.string().min(1)
  })
});

export type AiExtractionRequest = z.infer<typeof aiExtractionRequestSchema>;
export type AiExtractionStatus = (typeof aiExtractionStatusValues)[number];
export type AiExtractionErrorCode = (typeof aiExtractionErrorCodeValues)[number];
export type AiExtractionDraft = z.infer<typeof aiExtractionDraftSchema>;
export type AiExtractionConfirmedFields = z.infer<
  typeof aiExtractionConfirmedFieldsSchema
>;
export type AiExtractionReviewInput = z.infer<
  typeof aiExtractionReviewInputSchema
>;
export type AiExtractionResult = z.infer<typeof aiExtractionResultSchema>;
export type AiExtractionSuccessEnvelope = z.infer<
  typeof aiExtractionSuccessEnvelopeSchema
>;
export type AiExtractionErrorEnvelope = z.infer<typeof aiExtractionErrorEnvelopeSchema>;

export type AiExtractionConfidenceLabel = {
  tone: "high" | "medium" | "low";
  text: "높음" | "보통" | "낮음";
  percentage: number;
  displayText: string;
};

export function getAiExtractionConfidenceLabel(
  confidence: number
): AiExtractionConfidenceLabel {
  const percentage = Math.round(confidence * 100);

  if (confidence >= 0.75) {
    return {
      tone: "high",
      text: "높음",
      percentage,
      displayText: `높음 ${percentage}%`
    };
  }

  if (confidence >= 0.5) {
    return {
      tone: "medium",
      text: "보통",
      percentage,
      displayText: `보통 ${percentage}%`
    };
  }

  return {
    tone: "low",
    text: "낮음",
    percentage,
    displayText: `낮음 ${percentage}%`
  };
}
