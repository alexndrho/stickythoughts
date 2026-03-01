import 'server-only';

import { NotificationType } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { NOTIFICATION_UPDATE_INTERVAL_MS } from '@/config/user';

import { ReplyNotFoundError } from '@/server/letter/letter-errors';
import {
  upsertReplyLikeNotification,
  removeLikeNotification,
} from '@/server/letter/letter-notifications';

export { ReplyNotFoundError };

export async function likeReply(input: { letterId: string; replyId: string; userId: string }) {
  const replyStatus = await prisma.letterReply.findUnique({
    where: { id: input.replyId },
    select: {
      letterId: true,
      deletedAt: true,
      letter: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  if (
    !replyStatus ||
    replyStatus.letterId !== input.letterId ||
    replyStatus.deletedAt ||
    replyStatus.letter.deletedAt
  ) {
    throw new ReplyNotFoundError('Reply not found');
  }

  const replyLike = await prisma.letterReplyLike.create({
    data: {
      user: { connect: { id: input.userId } },
      reply: {
        connect: {
          id: input.replyId,
          letterId: input.letterId,
        },
      },
    },
    select: {
      userId: true,
      user: { select: { name: true, username: true } },
      reply: {
        select: {
          authorId: true,
          notifications: {
            take: 1,
            where: {
              type: NotificationType.LETTER_REPLY_LIKE,
              lastActivityAt: {
                gte: new Date(Date.now() - NOTIFICATION_UPDATE_INTERVAL_MS),
              },
            },
            select: { id: true },
            orderBy: { lastActivityAt: 'desc' },
          },
        },
      },
    },
  });

  if (replyLike.reply.authorId === replyLike.userId) {
    return;
  }

  await upsertReplyLikeNotification({
    replyId: input.replyId,
    letterId: input.letterId,
    actorUserId: replyLike.userId,
    actorName: replyLike.user.name || replyLike.user.username,
    recipientUserId: replyLike.reply.authorId,
    existingNotifications: replyLike.reply.notifications,
  });
}

export async function unlikeReply(input: { letterId: string; replyId: string; userId: string }) {
  const replyStatus = await prisma.letterReply.findUnique({
    where: { id: input.replyId },
    select: {
      letterId: true,
      deletedAt: true,
      letter: {
        select: {
          deletedAt: true,
        },
      },
    },
  });

  if (
    !replyStatus ||
    replyStatus.letterId !== input.letterId ||
    replyStatus.deletedAt ||
    replyStatus.letter.deletedAt
  ) {
    throw new ReplyNotFoundError('Reply not found');
  }

  const deletedLike = await prisma.letterReplyLike.delete({
    where: {
      userId_replyId: {
        userId: input.userId,
        replyId: input.replyId,
      },
      AND: {
        reply: {
          letterId: input.letterId,
        },
      },
    },
    select: {
      userId: true,
      reply: {
        select: {
          authorId: true,
          notifications: {
            where: {
              type: NotificationType.LETTER_REPLY_LIKE,
              actors: {
                some: {
                  userId: input.userId,
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

  if (deletedLike.reply.authorId === deletedLike.userId) {
    return;
  }

  await removeLikeNotification({
    actorUserId: deletedLike.userId,
    notifications: deletedLike.reply.notifications,
  });
}
