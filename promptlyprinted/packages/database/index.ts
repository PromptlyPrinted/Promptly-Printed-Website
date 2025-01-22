import "server-only";
import { PrismaClient } from "@prisma/client";
import { env } from "@repo/env";

declare global {
  var cachedPrisma: PrismaClient;
}

let database: PrismaClient;

if (process.env.NODE_ENV === "production") {
  database = new PrismaClient({
    log: ["error"],
    // Configure Prisma Accelerate with query caching
    datasourceUrl: process.env.DATABASE_URL,
  });
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  database = global.cachedPrisma;
}

export { database };

export * from "@prisma/client";
