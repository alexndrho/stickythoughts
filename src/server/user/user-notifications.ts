import 'server-only';

import { prisma } from '@/lib/db';
import { NOTIFICATION_PER_PAGE } from '@/config/user';
import { UserNotFoundError } from '@/server/user/user-errors';

export async function listUserNotifications(args: {
  userId: string;
  lastUpdatedAt?: string | null;
}) {
  return prisma.notification.findMany({
    take: NOTIFICATION_PER_PAGE,
    where: {
      userId: args.userId,
      updatedAt: {
        lt: args.lastUpdatedAt ? new Date(args.lastUpdatedAt) : undefined,
      },
    },
    select: {
      id: true,
      type: true,
      isRead: true,
      updatedAt: true,
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
      updatedAt: 'desc',
    },
  });
}

export async function countNewUserNotifications(args: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: {
      _count: {
        select: {
          notifications: {
            where: {
              isCountDecremented: false,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UserNotFoundError('User not found');
  }

  return user._count.notifications;
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
