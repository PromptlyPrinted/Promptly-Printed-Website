import "server-only";
import { PrismaClient } from "@prisma/client";
import { env } from "@repo/env";

export const database = new PrismaClient();

export * from "@prisma/client";
