import "server-only";

import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrisma() {
  const base =
    process.env.NODE_ENV === "production"
      ? new PrismaClient({
          accelerateUrl: process.env.DATABASE_URL!,
        })
      : new PrismaClient({
          adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
          }),
        });

  return base.$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrisma>;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
