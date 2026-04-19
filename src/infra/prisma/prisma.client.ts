import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  __preproductPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to use the Prisma listing repository.");
  }

  const adapter = new PrismaPg({
    connectionString
  });

  return new PrismaClient({ adapter });
}

export function getPrismaClient(): PrismaClient {
  const globalForPrisma = globalThis as PrismaGlobal;

  if (!globalForPrisma.__preproductPrisma) {
    globalForPrisma.__preproductPrisma = createPrismaClient();
  }

  return globalForPrisma.__preproductPrisma;
}
