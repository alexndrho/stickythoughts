import "server-only";

import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import { prisma } from "@/lib/db";

export async function listDeletedReplies(args: { page: number }) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

  return prisma.letterReply.findMany({
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
          id: true,
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
      letter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function countDeletedReplies() {
  return prisma.letterReply.count({
    where: {
      deletedAt: {
        not: null,
      },
    },
  });
}

export async function getDeletedReplyStatus(args: { replyId: string }) {
  return prisma.letterReply.findUnique({
    where: { id: args.replyId },
    select: { deletedAt: true },
  });
}

export async function restoreReply(args: { replyId: string }) {
  await prisma.letterReply.update({
    where: { id: args.replyId },
    data: { deletedAt: null, deletedById: null },
  });
}

export async function purgeReply(args: { replyId: string }) {
  await prisma.letterReply.delete({
    where: { id: args.replyId },
  });
}

