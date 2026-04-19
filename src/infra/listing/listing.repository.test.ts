import { Prisma } from "@prisma/client";

import {
  RetryableCreateListingError,
  RetryableUpdateListingStatusError
} from "@/domain/listing/listing.errors";
import { createListingRepository } from "@/infra/listing/listing.repository";

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();

const mockPrismaClient = {
  listing: {
    create: mockCreate,
    findUnique: mockFindUnique,
    findMany: mockFindMany,
    update: mockUpdate,
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
      initialStatus: "프리리스팅",
      currentStatus: "프리리스팅",
      createdAt: new Date("2026-04-19T00:00:00.000Z"),
      updatedAt: new Date("2026-04-19T00:00:00.000Z")
    });

    const listing = await repository.create({
      id: "916df0fd-cc73-48cb-84e9-837c9748c968",
      title: "맥북 프로 14",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 2850000,
      initialStatus: "프리리스팅",
      currentStatus: "프리리스팅",
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
        initialStatus: "프리리스팅",
        currentStatus: "프리리스팅",
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
      initialStatus: "프리리스팅",
      currentStatus: "프리리스팅",
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

  it("lists all stored listings for observability queries", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockFindMany.mockResolvedValueOnce([
      {
        id: "916df0fd-cc73-48cb-84e9-837c9748c968",
        title: "맥북 프로 14",
        category: "노트북",
        keySpecifications: ["M4 Pro", "24GB RAM"],
        priceKrw: 2850000,
        initialStatus: "판매중",
        currentStatus: "판매중",
        createdAt: new Date("2026-04-19T00:00:00.000Z"),
        updatedAt: new Date("2026-04-19T00:00:00.000Z")
      }
    ]);

    await expect(repository.listAll()).resolves.toMatchObject([
      {
        id: "916df0fd-cc73-48cb-84e9-837c9748c968",
        initialStatus: "판매중"
      }
    ]);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "asc"
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
        initialStatus: "프리리스팅",
        currentStatus: "프리리스팅",
        createdAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T00:00:00.000Z"
      })
    ).rejects.toBeInstanceOf(RetryableCreateListingError);
  });

  it("updates the current status and returns the refreshed timestamps", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockUpdate.mockResolvedValueOnce({
      id: "916df0fd-cc73-48cb-84e9-837c9748c968",
      title: "맥북 프로 14",
      category: "노트북",
      keySpecifications: ["M4 Pro", "24GB RAM"],
      priceKrw: 2850000,
      initialStatus: "프리리스팅",
      currentStatus: "판매중",
      createdAt: new Date("2026-04-19T00:00:00.000Z"),
      updatedAt: new Date("2026-04-19T00:05:00.000Z")
    });

    const listing = await repository.updateStatus(
      "916df0fd-cc73-48cb-84e9-837c9748c968",
      "판매중"
    );

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        id: "916df0fd-cc73-48cb-84e9-837c9748c968"
      },
      data: {
        currentStatus: "판매중"
      }
    });
    expect(listing).toMatchObject({
      currentStatus: "판매중",
      updatedAt: "2026-04-19T00:05:00.000Z"
    });
  });

  it("returns null when Prisma reports a missing row during status update", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockUpdate.mockRejectedValueOnce(
      Object.assign(Object.create(Prisma.PrismaClientKnownRequestError.prototype), {
        code: "P2025",
        message: "Record not found"
      })
    );

    await expect(
      repository.updateStatus("ef8cb604-d2e8-46fd-859c-a9c8187bbdca", "판매중")
    ).resolves.toBeNull();
  });

  it("wraps retryable Prisma update failures for the detail-page retry UX", async () => {
    const repository = createListingRepository(mockPrismaClient);

    mockUpdate.mockRejectedValueOnce(
      Object.assign(Object.create(Prisma.PrismaClientUnknownRequestError.prototype), {
        message: "database offline"
      })
    );

    await expect(
      repository.updateStatus("ef8cb604-d2e8-46fd-859c-a9c8187bbdca", "판매중")
    ).rejects.toBeInstanceOf(RetryableUpdateListingStatusError);
  });
});
