import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString =
  process.env["DATABASE_URL"] ??
  "postgresql://customerflow:customerflow@localhost:5432/customerflow?schema=public";

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"]
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
