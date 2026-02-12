import "server-only";

import { prisma } from "@/lib/db";
import { THOUGHTS_PER_PAGE } from "@/config/thought";
import {
  ADMIN_THOUGHTS_PER_PAGE,
  ADMIN_DELETED_PER_PAGE,
} from "@/config/admin";

export async function listPublicThoughts(args: {
  searchTerm?: string | null;
  lastId?: string | null;
}) {
  return prisma.thought.findMany({
    take: THOUGHTS_PER_PAGE,
    ...(args.lastId
      ? {
          skip: 1,
          cursor: {
            id: args.lastId,
          },
        }
      : {}),
    where: {
      ...(args.searchTerm && {
        author: {
          contains: args.searchTerm,
          mode: "insensitive",
        },
      }),
      deletedAt: null,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function createThought(args: {
  author: string;
  message: string;
  color: string;
}) {
  await prisma.thought.create({
    data: {
      author: args.author,
      message: args.message,
      color: args.color,
    },
  });
}

export async function countPublicThoughts() {
  return prisma.thought.count({
    where: { deletedAt: null },
  });
}

export async function countDeletedThoughts() {
  return prisma.thought.count({
    where: {
      deletedAt: {
        not: null,
      },
    },
  });
}

export async function listAdminThoughts(args: { page: number }) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_THOUGHTS_PER_PAGE;

  return prisma.thought.findMany({
    take: ADMIN_THOUGHTS_PER_PAGE,
    skip,
    where: {
      deletedAt: null,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      highlightedAt: true,
      createdAt: true,
      highlightedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}

export async function listDeletedThoughts(args: { page: number }) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

  return prisma.thought.findMany({
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

export async function getDeletedThoughtStatus(args: { thoughtId: string }) {
  return prisma.thought.findUnique({
    where: { id: args.thoughtId },
    select: { deletedAt: true },
  });
}

export async function restoreThought(args: { thoughtId: string }) {
  await prisma.thought.update({
    where: { id: args.thoughtId },
    data: { deletedAt: null, deletedById: null },
  });
}

export async function purgeThought(args: { thoughtId: string }) {
  await prisma.thought.delete({
    where: { id: args.thoughtId },
  });
}

export async function softDeleteThought(args: {
  thoughtId: string;
  deletedById: string;
}) {
  await prisma.thought.update({
    where: {
      id: args.thoughtId,
      deletedAt: null,
    },
    data: { deletedAt: new Date(), deletedById: args.deletedById },
  });
}
