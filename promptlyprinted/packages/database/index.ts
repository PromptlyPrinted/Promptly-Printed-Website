import "server-only";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "@repo/env";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};

declare global {
  var cachedPrisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.cachedPrisma ?? prismaClientSingleton();
export const database = prisma; // For backwards compatibility

if (process.env.NODE_ENV !== "production") {
  globalThis.cachedPrisma = prisma;
}

export * from "@prisma/client";
export type { User, Product, SavedImage } from "@prisma/client";
