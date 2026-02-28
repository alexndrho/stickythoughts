import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { NOTIFICATION_PER_PAGE } from '@/config/user';

const visibleNotificationWhere: Prisma.NotificationWhereInput = {
  OR: [
    {
      type: {
        in: ['LETTER_LIKE', 'LETTER_PENDING_REVIEW'],
      },
      letter: {
        is: {
          deletedAt: null,
        },
      },
    },
    {
      type: {
        in: ['LETTER_REPLY', 'LETTER_REPLY_LIKE'],
      },
      reply: {
        is: {
          deletedAt: null,
          letter: {
            deletedAt: null,
          },
        },
      },
    },
  ],
};

export async function listUserNotifications(args: {
  userId: string;
  lastActivityAt?: string | null;
}) {
  return prisma.notification.findMany({
    take: NOTIFICATION_PER_PAGE,
    where: {
      userId: args.userId,
      lastActivityAt: {
        lt: args.lastActivityAt ? new Date(args.lastActivityAt) : undefined,
      },
      ...visibleNotificationWhere,
    },
    select: {
      id: true,
      type: true,
      isRead: true,
      lastActivityAt: true,
      letter: {
        select: {
          id: true,
          recipient: true,
          body: true,
        },
      },
      reply: {
        select: {
          id: true,
          body: true,
          isAnonymous: true,
          letter: {
            select: {
              id: true,
            },
          },
        },
      },
      actors: {
        take: 1,
        select: {
          user: {
            select: {
              image: true,
              name: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          actors: true,
        },
      },
    },
    orderBy: {
      lastActivityAt: 'desc',
    },
  });
}

export async function countNewUserNotifications(args: { userId: string }) {
  return prisma.notification.count({
    where: {
      userId: args.userId,
      isCountDecremented: false,
      ...visibleNotificationWhere,
    },
  });
}

export async function setNotificationsOpened(args: { userId: string; opened: boolean }) {
  await prisma.user.update({
    where: { id: args.userId },
    data: {
      notifications: {
        updateMany: {
          where: { isCountDecremented: false },
          data: { isCountDecremented: args.opened },
        },
      },
    },
  });
}

export async function markNotificationRead(args: {
  notificationId: string;
  userId: string;
  isRead: boolean;
}) {
  await prisma.notification.update({
    where: { id: args.notificationId, userId: args.userId },
    data: { isRead: args.isRead },
  });
}

export async function deleteNotification(args: { notificationId: string; userId: string }) {
  await prisma.notification.delete({
    where: { id: args.notificationId, userId: args.userId },
  });
}
