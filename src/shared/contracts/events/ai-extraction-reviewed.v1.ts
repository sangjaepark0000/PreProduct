import {
  aiExtractionConfirmedFieldsSchema,
  aiExtractionDraftSchema,
  type AiExtractionConfirmedFields,
  type AiExtractionDraft
} from "@/shared/contracts/ai-extraction";

import { z } from "zod";

export const aiExtractionReviewedFieldValues = [
  "title",
  "category",
  "keySpecifications",
  "confidence",
  "fallbackRecommended"
] as const;

export const aiExtractionReviewedFieldSchema = z.enum(
  aiExtractionReviewedFieldValues
);

export const aiExtractionReviewedV1Schema = z
  .object({
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    traceId: z.string().min(8),
    schemaVersion: z.literal("1.0.0"),
    payload: z
      .object({
        clientRequestId: z.string().min(1),
        idempotencyKey: z.string().min(1),
        requestVersion: z.number().int().positive(),
        acceptedFields: z.array(aiExtractionReviewedFieldSchema),
        editedFields: z.array(aiExtractionReviewedFieldSchema),
        confidence: z.number().min(0).max(1),
        fallbackRecommended: z.boolean()
      })
      .strict()
  })
  .strict();

export type AiExtractionReviewedField = z.infer<
  typeof aiExtractionReviewedFieldSchema
>;
export type AiExtractionReviewedV1 = z.infer<
  typeof aiExtractionReviewedV1Schema
>;

type AiExtractionDraftInput = Omit<AiExtractionDraft, "keySpecifications"> & {
  keySpecifications: readonly string[];
};

type AiExtractionConfirmedFieldsInput = Omit<
  AiExtractionConfirmedFields,
  "keySpecifications"
> & {
  keySpecifications: readonly string[];
};

export type BuildAiExtractionReviewedV1Input = {
  clientRequestId: string;
  idempotencyKey: string;
  requestVersion: number;
  traceId: string;
  occurredAt?: string;
  draft: AiExtractionDraftInput;
  confirmedFields: AiExtractionConfirmedFieldsInput;
};

function normalizeSpecifications(specifications: readonly string[]): string[] {
  return specifications.map((value) => value.trim()).filter(Boolean);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function fnv1a128(input: string): string {
  let first = 0x6c62272e07bb0142n;
  let second = 0x62b821756295c58dn;
  const prime = 0x100000001b3n;
  const mask = (1n << 64n) - 1n;

  for (let index = 0; index < input.length; index += 1) {
    first ^= BigInt(input.charCodeAt(index));
    first = (first * prime) & mask;
    second ^= BigInt(input.charCodeAt(input.length - index - 1));
    second = (second * prime) & mask;
  }

  return `${first.toString(16).padStart(16, "0")}${second
    .toString(16)
    .padStart(16, "0")}`;
}

export function buildDeterministicAiExtractionReviewedEventId(input: {
  idempotencyKey: string;
  requestVersion: number;
  confirmedFields: AiExtractionConfirmedFieldsInput;
}): string {
  const canonical = stableStringify({
    idempotencyKey: input.idempotencyKey,
    requestVersion: input.requestVersion,
    confirmedFields: {
      title: input.confirmedFields.title.trim(),
      category: input.confirmedFields.category.trim(),
      keySpecifications: normalizeSpecifications(
        input.confirmedFields.keySpecifications
      )
    }
  });
  const hash = fnv1a128(canonical).split("");

  hash[12] = "5";
  hash[16] = ((Number.parseInt(hash[16] ?? "0", 16) & 0x3) | 0x8).toString(16);

  return `${hash.slice(0, 8).join("")}-${hash.slice(8, 12).join("")}-${hash
    .slice(12, 16)
    .join("")}-${hash.slice(16, 20).join("")}-${hash.slice(20, 32).join("")}`;
}

export function deriveAiExtractionReviewedFields(input: {
  draft: AiExtractionDraftInput;
  confirmedFields: AiExtractionConfirmedFieldsInput;
}): {
  acceptedFields: AiExtractionReviewedField[];
  editedFields: AiExtractionReviewedField[];
} {
  const draft = aiExtractionDraftSchema.parse(input.draft);
  const confirmedFields = aiExtractionConfirmedFieldsSchema.parse({
    ...input.confirmedFields,
    keySpecifications: normalizeSpecifications(
      input.confirmedFields.keySpecifications
    )
  });
  const acceptedFields: AiExtractionReviewedField[] = [];
  const editedFields: AiExtractionReviewedField[] = [];

  if (draft.title.trim() === confirmedFields.title.trim()) {
    acceptedFields.push("title");
  } else {
    editedFields.push("title");
  }

  if (draft.category.trim() === confirmedFields.category.trim()) {
    acceptedFields.push("category");
  } else {
    editedFields.push("category");
  }

  if (
    stableStringify(normalizeSpecifications(draft.keySpecifications)) ===
    stableStringify(confirmedFields.keySpecifications)
  ) {
    acceptedFields.push("keySpecifications");
  } else {
    editedFields.push("keySpecifications");
  }

  acceptedFields.push("confidence", "fallbackRecommended");

  return { acceptedFields, editedFields };
}

export function buildAiExtractionReviewedV1(
  input: BuildAiExtractionReviewedV1Input
): AiExtractionReviewedV1 {
  const confirmedFields = aiExtractionConfirmedFieldsSchema.parse({
    ...input.confirmedFields,
    keySpecifications: normalizeSpecifications(input.confirmedFields.keySpecifications)
  });
  const draft = aiExtractionDraftSchema.parse(input.draft);
  const reviewedFields = deriveAiExtractionReviewedFields({
    draft,
    confirmedFields
  });
  const event: AiExtractionReviewedV1 = {
    eventId: buildDeterministicAiExtractionReviewedEventId({
      idempotencyKey: input.idempotencyKey,
      requestVersion: input.requestVersion,
      confirmedFields
    }),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    traceId: input.traceId,
    schemaVersion: "1.0.0",
    payload: {
      clientRequestId: input.clientRequestId,
      idempotencyKey: input.idempotencyKey,
      requestVersion: input.requestVersion,
      ...reviewedFields,
      confidence: draft.confidence,
      fallbackRecommended: draft.fallbackRecommended
    }
  };

  return aiExtractionReviewedV1Schema.parse(event);
}
