import { Prisma } from "@prisma/client";

import {
  RetryableCreateListingError,
  RetryableUpdateListingStatusError
} from "@/domain/listing/listing.errors";
import { listingSchema, type Listing } from "@/domain/listing/listing";
import { type ListingRepository } from "@/domain/listing/listing.service";
import { getPrismaClient } from "@/infra/prisma/prisma.client";

type ListingRecord = {
  id: string;
  title: string;
  category: string;
  keySpecifications: string[];
  priceKrw: number;
  initialStatus: string;
  currentStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

type ListingPersistenceClient = {
  listing: {
    create: (args: {
      data: {
        id: string;
        title: string;
        category: string;
        keySpecifications: string[];
        priceKrw: number;
        initialStatus: string;
        currentStatus: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }) => Promise<ListingRecord>;
    findUnique: (args: { where: { id: string } }) => Promise<ListingRecord | null>;
    update: (args: {
      where: {
        id: string;
      };
      data: {
        currentStatus: string;
      };
    }) => Promise<ListingRecord>;
    deleteMany: () => Promise<unknown>;
  };
};

function toDomainListing(record: ListingRecord): Listing {
  return listingSchema.parse({
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  });
}

function isRetryableListingWriteError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export function createListingRepository(
  prismaClient: ListingPersistenceClient
): ListingRepository {
  return {
    async create(listing) {
      const parsedListing = listingSchema.parse(listing);
      let storedListing: ListingRecord;

      try {
        storedListing = await prismaClient.listing.create({
          data: {
            id: parsedListing.id,
            title: parsedListing.title,
            category: parsedListing.category,
            keySpecifications: parsedListing.keySpecifications,
            priceKrw: parsedListing.priceKrw,
            initialStatus: parsedListing.initialStatus,
            currentStatus: parsedListing.currentStatus,
            createdAt: new Date(parsedListing.createdAt),
            updatedAt: new Date(parsedListing.updatedAt)
          }
        });
      } catch (error: unknown) {
        if (isRetryableListingWriteError(error)) {
          throw new RetryableCreateListingError(undefined, {
            cause: error
          });
        }

        throw error;
      }

      return toDomainListing(storedListing);
    },
    async findById(listingId) {
      const parsedListingId = listingSchema.shape.id.parse(listingId);
      const storedListing = await prismaClient.listing.findUnique({
        where: {
          id: parsedListingId
        }
      });

      return storedListing ? toDomainListing(storedListing) : null;
    },
    async updateStatus(listingId, status) {
      const parsedListingId = listingSchema.shape.id.parse(listingId);
      const parsedStatus = listingSchema.shape.currentStatus.parse(status);
      let storedListing: ListingRecord;

      try {
        storedListing = await prismaClient.listing.update({
          where: {
            id: parsedListingId
          },
          data: {
            currentStatus: parsedStatus
          }
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          return null;
        }

        if (isRetryableListingWriteError(error)) {
          throw new RetryableUpdateListingStatusError(undefined, {
            cause: error
          });
        }

        throw error;
      }

      return toDomainListing(storedListing);
    }
  };
}

export function getListingRepository(): ListingRepository {
  return createListingRepository(getPrismaClient());
}

export async function resetListingRepository(): Promise<void> {
  await getPrismaClient().listing.deleteMany();
}
