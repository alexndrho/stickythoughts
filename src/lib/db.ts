import "server-only";

import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClient = databaseUrl.startsWith("prisma://")
  ? new PrismaClient({
      accelerateUrl: databaseUrl,
    })
  : new PrismaClient({
      adapter: new PrismaPg({
        connectionString: databaseUrl,
      }),
    });

export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
