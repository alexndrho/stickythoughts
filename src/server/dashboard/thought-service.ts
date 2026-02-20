import 'server-only';

import { subDays } from 'date-fns';

import { ADMIN_DELETED_PER_PAGE, ADMIN_THOUGHTS_PER_PAGE } from '@/config/admin';
import { prisma } from '@/lib/db';
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS } from '@/config/thought';
import type { PrivateHighlightedThought } from '@/types/thought';

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
      highlightedAt: null,
      highlightedById: null,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      highlightedAt: true,
      createdAt: true,
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
      deletedAt: 'desc',
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

export async function softDeleteThought(args: { thoughtId: string; deletedById: string }) {
  await prisma.thought.update({
    where: {
      id: args.thoughtId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
      deletedById: args.deletedById,
      highlightedAt: null,
      highlightedById: null,
    },
  });
}

export async function findCurrentHighlight() {
  return prisma.thought.findFirst({
    where: {
      highlightedAt: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      highlightedAt: true,
    },
    orderBy: {
      highlightedAt: 'desc',
    },
  });
}

export async function getThoughtHighlightStatus(args: { thoughtId: string }) {
  return prisma.thought.findUnique({
    where: { id: args.thoughtId },
    select: { highlightedAt: true },
  });
}

export async function getHighlightedThought(): Promise<PrivateHighlightedThought | null> {
  const highlightCutoff = subDays(new Date(), THOUGHT_HIGHLIGHT_MAX_AGE_DAYS);

  const thought = await prisma.thought.findFirst({
    where: {
      highlightedAt: { not: null, gte: highlightCutoff },
      highlightedById: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
      highlightedAt: true,
      highlightedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: {
      highlightedAt: 'desc',
    },
  });

  if (!thought) {
    return null;
  }

  if (!thought.highlightedAt || !thought.highlightedBy) {
    return null;
  }

  return {
    ...thought,
    highlightedAt: thought.highlightedAt,
    highlightedBy: thought.highlightedBy,
  };
}

export async function updateHighlight(args: {
  highlighted: boolean;
  thoughtId: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (args.highlighted) {
      await tx.thought.updateMany({
        where: {
          highlightedAt: { not: null },
          deletedAt: null,
          id: { not: args.thoughtId },
        },
        data: {
          highlightedAt: null,
          highlightedById: null,
        },
      });
    }

    return tx.thought.update({
      where: { id: args.thoughtId },
      data: args.highlighted
        ? { highlightedAt: new Date(), highlightedById: args.userId }
        : { highlightedAt: null, highlightedById: null },
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
  });
}
