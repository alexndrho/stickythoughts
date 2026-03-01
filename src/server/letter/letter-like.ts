import 'server-only';

import { NotificationType } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { NOTIFICATION_UPDATE_INTERVAL_MS } from '@/config/user';
import { LetterNotFoundError } from '@/server/letter/letter-errors';
import {
  upsertLetterLikeNotification,
  removeLikeNotification,
} from '@/server/letter/letter-notifications';

export async function likeLetter(args: { letterId: string; userId: string }): Promise<void> {
  const letterStatus = await prisma.letter.findUnique({
    where: { id: args.letterId },
    select: { deletedAt: true },
  });

  if (!letterStatus || letterStatus.deletedAt) {
    throw new LetterNotFoundError('Letter post not found');
  }

  const letterLike = await prisma.letterLike.create({
    data: {
      user: {
        connect: {
          id: args.userId,
        },
      },
      letter: {
        connect: {
          id: args.letterId,
        },
      },
    },
    select: {
      userId: true,
      user: { select: { name: true, username: true } },
      letter: {
        select: {
          authorId: true,
          notifications: {
            take: 1,
            where: {
              type: NotificationType.LETTER_LIKE,
              lastActivityAt: {
                gte: new Date(Date.now() - NOTIFICATION_UPDATE_INTERVAL_MS),
              },
            },
            select: { id: true },
            orderBy: {
              lastActivityAt: 'desc',
            },
          },
        },
      },
    },
  });

  if (letterLike.letter.authorId === letterLike.userId) return;
  const recipientUserId = letterLike.letter.authorId;
  if (!recipientUserId) return;

  await upsertLetterLikeNotification({
    letterId: args.letterId,
    actorUserId: letterLike.userId,
    actorName: letterLike.user.name || letterLike.user.username,
    recipientUserId,
    existingNotifications: letterLike.letter.notifications,
  });
}

export async function unlikeLetter(args: { letterId: string; userId: string }): Promise<void> {
  const deletedLetterLike = await prisma.letterLike.delete({
    where: {
      userId_letterId: {
        userId: args.userId,
        letterId: args.letterId,
      },
    },
    select: {
      userId: true,
      letter: {
        select: {
          authorId: true,
          notifications: {
            where: {
              type: NotificationType.LETTER_LIKE,
              actors: {
                some: {
                  userId: args.userId,
                },
              },
            },
            select: {
              id: true,
              _count: {
                select: {
                  actors: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (deletedLetterLike.letter.authorId === deletedLetterLike.userId) return;

  await removeLikeNotification({
    actorUserId: deletedLetterLike.userId,
    notifications: deletedLetterLike.letter.notifications,
  });
}
