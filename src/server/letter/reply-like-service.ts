import "server-only";

import { NotificationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { NOTIFICATION_UPDATE_INTERVAL_MS } from "@/config/user";

import { ReplyNotFoundError } from "@/server/letter/letter-errors";

export { ReplyNotFoundError };

export async function likeReply(input: {
  letterId: string;
  replyId: string;
  userId: string;
}) {
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
    throw new ReplyNotFoundError("Reply not found");
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
      reply: {
        select: {
          authorId: true,
          notifications: {
            take: 1,
            where: {
              type: NotificationType.LETTER_REPLY_LIKE,
              updatedAt: {
                gte: new Date(Date.now() - NOTIFICATION_UPDATE_INTERVAL_MS),
              },
            },
            select: { id: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  if (replyLike.reply.authorId === replyLike.userId) {
    return;
  }

  if (replyLike.reply.notifications.length > 0) {
    await prisma.notification.update({
      where: { id: replyLike.reply.notifications[0].id },
      data: {
        isRead: false,
        isCountDecremented: false,
        actors: {
          create: { userId: replyLike.userId },
        },
      },
    });
    return;
  }

  await prisma.notification.create({
    data: {
      user: { connect: { id: replyLike.reply.authorId } },
      type: NotificationType.LETTER_REPLY_LIKE,
      actors: { create: { userId: replyLike.userId } },
      reply: { connect: { id: input.replyId } },
    },
  });
}

export async function unlikeReply(input: {
  letterId: string;
  replyId: string;
  userId: string;
}) {
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
    throw new ReplyNotFoundError("Reply not found");
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

  const notificationsToDelete = deletedLike.reply.notifications
    .filter((n) => n._count.actors <= 1)
    .map((n) => n.id);
  const notificationsToUpdate = deletedLike.reply.notifications
    .filter((n) => n._count.actors > 1)
    .map((n) => n.id);

  if (notificationsToDelete.length > 0) {
    await prisma.notification.deleteMany({
      where: { id: { in: notificationsToDelete } },
    });
  }

  if (notificationsToUpdate.length > 0) {
    await prisma.notificationActor.deleteMany({
      where: {
        notificationId: { in: notificationsToUpdate },
        userId: deletedLike.userId,
      },
    });
  }
}
