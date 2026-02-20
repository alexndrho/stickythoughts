import 'server-only';

import { PrismaClient } from '@/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrisma() {
  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate());
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
