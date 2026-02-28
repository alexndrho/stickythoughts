import 'server-only';

import { NotificationType } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { NOTIFICATION_UPDATE_INTERVAL_MS } from '@/config/user';
import { LetterNotFoundError } from '@/server/letter/letter-errors';

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

  if (letterLike.letter.notifications.length > 0) {
    await prisma.notification.update({
      where: {
        id: letterLike.letter.notifications[0].id,
      },
      data: {
        isRead: false,
        isCountDecremented: false,
        lastActivityAt: new Date(),
        actors: {
          create: {
            userId: letterLike.userId,
          },
        },
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        user: { connect: { id: recipientUserId } },
        type: NotificationType.LETTER_LIKE,
        letter: { connect: { id: args.letterId } },
        actors: {
          create: {
            userId: letterLike.userId,
          },
        },
      },
    });
  }
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

  const notificationsToDelete = deletedLetterLike.letter.notifications
    .filter((notification) => notification._count.actors <= 1)
    .map((notification) => notification.id);
  const notificationsToUpdate = deletedLetterLike.letter.notifications
    .filter((notification) => notification._count.actors > 1)
    .map((notification) => notification.id);

  // Delete notifications with only 1 actor
  if (notificationsToDelete.length > 0) {
    await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationsToDelete,
        },
      },
    });
  }

  // Remove the actor from notifications with multiple actors
  if (notificationsToUpdate.length > 0) {
    await prisma.notificationActor.deleteMany({
      where: {
        notificationId: { in: notificationsToUpdate },
        userId: deletedLetterLike.userId,
      },
    });
  }
}
