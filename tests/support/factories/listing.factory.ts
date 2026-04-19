import { faker } from "@faker-js/faker";

export type ListingDraft = {
  id: string;
  sellerId: string;
  title: string;
  category: "smartphone" | "tablet" | "laptop";
  condition: "excellent" | "good" | "fair";
  priceKrw: number;
  description: string;
};

export function createListingDraft(
  overrides: Partial<ListingDraft> = {}
): ListingDraft {
  const draft: ListingDraft = {
    id: faker.string.uuid(),
    sellerId: faker.string.uuid(),
    title: `${faker.company.name()} ${faker.commerce.productName()}`,
    category: "smartphone",
    condition: "good",
    priceKrw: faker.number.int({ min: 15_000, max: 120_000 }),
    description: faker.commerce.productDescription(),
    ...overrides
  };

  return draft;
}
