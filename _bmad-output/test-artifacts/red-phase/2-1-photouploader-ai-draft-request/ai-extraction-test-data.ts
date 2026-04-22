export type AiExtractionTestFileOptions = {
  name?: string;
  type?: string;
  sizeBytes?: number;
  contents?: string;
};

export const aiExtractionRequestMeta = {
  clientRequestId: "client-req-story-2-1",
  idempotencyKey: "idem-story-2-1-photo-001",
  requestVersion: 1
} as const;

export type AiExtractionRequestMeta = {
  clientRequestId: string;
  idempotencyKey: string;
  requestVersion: number;
};

export function createAiExtractionTestFile({
  name = "macbook-photo.jpg",
  type = "image/jpeg",
  sizeBytes,
  contents = "fake-jpeg-bytes"
}: AiExtractionTestFileOptions = {}): File {
  const payload = sizeBytes
    ? new Uint8Array(sizeBytes)
    : new TextEncoder().encode(contents);

  return new File([payload], name, { type });
}

export function buildAiExtractionFormData(
  file = createAiExtractionTestFile(),
  meta: AiExtractionRequestMeta = aiExtractionRequestMeta
): FormData {
  const formData = new FormData();

  formData.set("photo", file);
  formData.set("clientRequestId", meta.clientRequestId);
  formData.set("idempotencyKey", meta.idempotencyKey);
  formData.set("requestVersion", `${meta.requestVersion}`);

  return formData;
}
