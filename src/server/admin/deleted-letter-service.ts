import "server-only";

import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import { prisma } from "@/lib/db";

export async function listDeletedLetters(args: { page: number }) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

  return prisma.letter.findMany({
    where: {
      deletedAt: {
        not: null,
      },
    },
    orderBy: {
      deletedAt: "desc",
    },
    take: ADMIN_DELETED_PER_PAGE,
    skip,
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      deletedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}

export async function countDeletedLetters() {
  return prisma.letter.count({
    where: {
      deletedAt: {
        not: null,
      },
    },
  });
}

export async function getDeletedLetterStatus(args: { letterId: string }) {
  return prisma.letter.findUnique({
    where: { id: args.letterId },
    select: { deletedAt: true },
  });
}

export async function restoreLetter(args: { letterId: string }) {
  await prisma.letter.update({
    where: { id: args.letterId },
    data: { deletedAt: null, deletedById: null },
  });
}

export async function purgeLetter(args: { letterId: string }) {
  await prisma.letter.delete({
    where: { id: args.letterId },
  });
}

