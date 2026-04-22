import { faker } from "@faker-js/faker";

export type PricingConfirmationScenario = {
  clientRequestId: string;
  idempotencyKey: string;
  traceId: string;
  title: string;
  category: string;
  keySpecificationsText: string;
  basisRevision: string;
  suggestedPriceKrw: number;
  editedPriceKrw: number;
  maxPriceKrw: number;
  manualReason: string;
};

export function createPricingConfirmationScenario(
  overrides: Partial<PricingConfirmationScenario> = {}
): PricingConfirmationScenario {
  const idempotencyKey = faker.string.uuid();

  return {
    clientRequestId: `client-${faker.string.alphanumeric(10)}`,
    idempotencyKey,
    traceId: `trace-${faker.string.alphanumeric(12)}`,
    title: `ATDD ${faker.commerce.productName()}`,
    category: "노트북",
    keySpecificationsText: "M3 Pro\n18GB RAM\n512GB SSD",
    basisRevision: `basis-${idempotencyKey.slice(0, 8)}`,
    suggestedPriceKrw: 1_240_000,
    editedPriceKrw: 1_180_000,
    maxPriceKrw: 99_999_999,
    manualReason: "구성품 누락을 반영한 수동 수정",
    ...overrides
  };
}
