import 'server-only';

import { subDays } from 'date-fns';

import { prisma } from '@/lib/db';
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS, THOUGHTS_PER_PAGE } from '@/config/thought';

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
          mode: 'insensitive',
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
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export async function createThought(args: { author: string; message: string; color: string }) {
  return prisma.thought.create({
    data: {
      author: args.author,
      message: args.message,
      color: args.color,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });
}

export async function countPublicThoughts() {
  return prisma.thought.count({
    where: { deletedAt: null },
  });
}

export async function getHighlightedThought() {
  const highlightCutoff = subDays(new Date(), THOUGHT_HIGHLIGHT_MAX_AGE_DAYS);

  return prisma.thought.findFirst({
    where: {
      deletedAt: null,
      highlightedAt: { not: null, gte: highlightCutoff },
    },
    orderBy: {
      highlightedAt: 'desc',
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });
}
