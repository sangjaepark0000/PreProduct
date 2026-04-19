import { Prisma } from "@prisma/client";

import { RetryableCreateListingError } from "@/domain/listing/listing.errors";
import { createListingRepository } from "@/infra/listing/listing.repository";

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();

const mockPrismaClient = {
  listing: {
    create: mockCreate,
    findUnique: mockFindUnique,
    deleteMany: jest.fn()
  }
};

describe("listing.repository", () => {
  it("stores listings through Prisma and maps date fields back to the domain shape", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockCreate.mockResolvedValueOnce({
      id: "916df0fd-cc73-48cb-84e9-837c9748c968",
      title: "맥북 프로 14",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 2850000,
      createdAt: new Date("2026-04-19T00:00:00.000Z"),
      updatedAt: new Date("2026-04-19T00:00:00.000Z")
    });

    const listing = await repository.create({
      id: "916df0fd-cc73-48cb-84e9-837c9748c968",
      title: "맥북 프로 14",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 2850000,
      createdAt: "2026-04-19T00:00:00.000Z",
      updatedAt: "2026-04-19T00:00:00.000Z"
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        id: "916df0fd-cc73-48cb-84e9-837c9748c968",
        title: "맥북 프로 14",
        category: "노트북",
        keySpecifications: ["M4 Pro", "24GB RAM"],
        priceKrw: 2850000,
        createdAt: new Date("2026-04-19T00:00:00.000Z"),
        updatedAt: new Date("2026-04-19T00:00:00.000Z")
      }
    });
    expect(listing).toMatchObject({
      id: "916df0fd-cc73-48cb-84e9-837c9748c968",
      title: "맥북 프로 14",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 2850000,
      createdAt: "2026-04-19T00:00:00.000Z",
      updatedAt: "2026-04-19T00:00:00.000Z"
    });
  });

  it("returns null when Prisma cannot find a listing", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockFindUnique.mockResolvedValueOnce(null);

    await expect(
      repository.findById("ef8cb604-d2e8-46fd-859c-a9c8187bbdca")
    ).resolves.toBeNull();
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "ef8cb604-d2e8-46fd-859c-a9c8187bbdca"
      }
    });
  });

  it("wraps retryable Prisma write failures for the action retry UX", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockCreate.mockRejectedValueOnce(
      Object.assign(Object.create(Prisma.PrismaClientInitializationError.prototype), {
        message: "database offline"
      })
    );

    await expect(
      repository.create({
        id: "916df0fd-cc73-48cb-84e9-837c9748c968",
        title: "맥북 프로 14",
        category: "노트북",
        keySpecifications: ["M4 Pro", "24GB RAM"],
        priceKrw: 2850000,
        createdAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T00:00:00.000Z"
      })
    ).rejects.toBeInstanceOf(RetryableCreateListingError);
  });
});
