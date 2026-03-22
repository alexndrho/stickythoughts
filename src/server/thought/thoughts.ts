import 'server-only';

import { subDays } from 'date-fns';

import { type ThoughtPattern, Prisma, ThoughtColor } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS, THOUGHTS_PER_PAGE } from '@/config/thought';
import { moderateContent } from '@/server/moderation';
import { notifyStaffPendingThought } from '@/server/letter/letter-notifications';
import { type ModerationStatus } from '@/generated/prisma/enums';
import type { ThoughtsSort } from '@/types/thought';

async function listPublicThoughtsRandom(args: {
  seed: string;
  searchTerm?: string | null;
  lastId?: string | null;
}) {
  const seed = args.seed;

  const searchCondition = args.searchTerm
    ? Prisma.sql`AND author ILIKE ${'%' + args.searchTerm + '%'}`
    : Prisma.empty;

  const cursorCondition = args.lastId
    ? Prisma.sql`AND md5(id || ${seed}) > md5(${args.lastId} || ${seed})`
    : Prisma.empty;

  return prisma.$queryRaw<
    Array<{
      id: string;
      author: string;
      message: string;
      color: ThoughtColor;
      pattern: ThoughtPattern;
      resonanceCount: number;
      createdAt: Date;
    }>
  >`
    SELECT id, author, message, color, pattern, "createdAt", "resonanceCount"
    FROM "Thought"
    WHERE status = 'APPROVED'
      AND "deletedAt" IS NULL
      ${searchCondition}
      ${cursorCondition}
    ORDER BY md5(id || ${seed})
    LIMIT ${THOUGHTS_PER_PAGE}
  `;
}

export async function listPublicThoughts(args: {
  sort?: ThoughtsSort | null;
  searchTerm?: string | null;
  lastId?: string | null;
  seed?: string | null;
}) {
  if (args.sort === 'random' && args.seed) {
    return listPublicThoughtsRandom({
      seed: args.seed,
      searchTerm: args.searchTerm,
      lastId: args.lastId,
    });
  }

  const orderDirection = args.sort === 'oldest' ? 'asc' : 'desc';

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
      status: 'APPROVED',
      deletedAt: null,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      pattern: true,
      resonanceCount: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: orderDirection }, { id: orderDirection }],
  });
}

export async function createThought(args: {
  author: string;
  message: string;
  color: ThoughtColor;
  pattern: ThoughtPattern;
}) {
  let moderationStatus: ModerationStatus = 'PENDING';
  try {
    const { flagged } = await moderateContent({
      type: 'text',
      text: [args.author, args.message].filter(Boolean).join(' '),
    });

    moderationStatus = flagged ? 'FLAGGED' : 'APPROVED';
  } catch (error) {
    console.error('Error during content moderation:', error);
    // We use light moderation for thoughts: auto-approve on service failure to avoid
    // blocking submissions due to moderation outages (false negatives are preferred over
    // false positives here).
    moderationStatus = 'APPROVED';
  }

  const createdThought = await prisma.thought.create({
    data: {
      author: args.author,
      message: args.message,
      color: args.color,
      pattern: args.pattern,
      status: moderationStatus,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      pattern: true,
      resonanceCount: true,
      status: true,
      createdAt: true,
    },
  });

  if (createdThought.status === 'FLAGGED') {
    notifyStaffPendingThought({ thoughtId: createdThought.id }).catch(() => {});
  }

  return createdThought;
}

export async function resonateThought(args: { thoughtId: string }) {
  return prisma.thought.update({
    where: {
      id: args.thoughtId,
      status: 'APPROVED',
      deletedAt: null,
    },
    data: {
      resonanceCount: { increment: 1 },
    },
    select: {
      resonanceCount: true,
    },
  });
}

export async function countPublicThoughts() {
  return prisma.thought.count({
    where: { deletedAt: null, status: 'APPROVED' },
  });
}

export async function getHighlightedThought() {
  const highlightCutoff = subDays(new Date(), THOUGHT_HIGHLIGHT_MAX_AGE_DAYS);

  return prisma.thought.findFirst({
    where: {
      status: 'APPROVED',
      highlightedAt: { not: null, gte: highlightCutoff },
      deletedAt: null,
    },
    orderBy: {
      highlightedAt: 'desc',
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      pattern: true,
      resonanceCount: true,
      createdAt: true,
    },
  });
}
