import 'server-only';

import { subDays } from 'date-fns';

import { prisma } from '@/lib/db';
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS, THOUGHTS_PER_PAGE } from '@/config/thought';
import { moderateContent } from '@/server/moderation';
import { notifyStaffPendingThought } from '@/server/letter/letter-notifications';
import { type ModerationStatus } from '@/generated/prisma/enums';

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
      status: 'APPROVED',
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
      status: moderationStatus,
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      status: true,
      createdAt: true,
    },
  });

  if (createdThought.status === 'FLAGGED') {
    notifyStaffPendingThought({ thoughtId: createdThought.id }).catch(() => {});
  }

  return createdThought;
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
      createdAt: true,
    },
  });
}
