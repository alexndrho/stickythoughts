import 'server-only';

import { NotificationType } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { sendPushNotificationsToUser } from '@/server/user/user-push-subscriptions';

export async function upsertLetterLikeNotification(args: {
  letterId: string;
  actorUserId: string;
  actorName: string;
  recipientUserId: string;
  existingNotifications: { id: string }[];
}): Promise<void> {
  try {
    if (args.existingNotifications.length > 0) {
      await prisma.notification.update({
        where: { id: args.existingNotifications[0].id },
        data: {
          isRead: false,
          isCountDecremented: false,
          lastActivityAt: new Date(),
          actors: { create: { userId: args.actorUserId } },
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          user: { connect: { id: args.recipientUserId } },
          type: NotificationType.LETTER_LIKE,
          letter: { connect: { id: args.letterId } },
          actors: { create: { userId: args.actorUserId } },
        },
      });
    }

    sendPushNotificationsToUser(args.recipientUserId, {
      title: args.actorName,
      body: 'Liked your letter',
      url: `/letters/${args.letterId}`,
    }).catch(() => {});
  } catch (error) {
    console.error('Failed to upsert letter like notification', {
      letterId: args.letterId,
      actorUserId: args.actorUserId,
      error,
    });
  }
}

export async function upsertReplyLikeNotification(args: {
  replyId: string;
  letterId: string;
  actorUserId: string;
  actorName: string;
  recipientUserId: string;
  existingNotifications: { id: string }[];
}): Promise<void> {
  try {
    if (args.existingNotifications.length > 0) {
      await prisma.notification.update({
        where: { id: args.existingNotifications[0].id },
        data: {
          isRead: false,
          isCountDecremented: false,
          lastActivityAt: new Date(),
          actors: { create: { userId: args.actorUserId } },
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          user: { connect: { id: args.recipientUserId } },
          type: NotificationType.LETTER_REPLY_LIKE,
          actors: { create: { userId: args.actorUserId } },
          reply: { connect: { id: args.replyId } },
        },
      });
    }

    sendPushNotificationsToUser(args.recipientUserId, {
      title: args.actorName,
      body: 'Liked your reply',
      url: `/letters/${args.letterId}`,
    }).catch(() => {});
  } catch (error) {
    console.error('Failed to upsert reply like notification', {
      replyId: args.replyId,
      actorUserId: args.actorUserId,
      error,
    });
  }
}

export async function removeLikeNotification(args: {
  actorUserId: string;
  notifications: { id: string; _count: { actors: number } }[];
}): Promise<void> {
  try {
    const toDelete = args.notifications.filter((n) => n._count.actors <= 1).map((n) => n.id);
    const toUpdate = args.notifications.filter((n) => n._count.actors > 1).map((n) => n.id);

    if (toDelete.length > 0) {
      await prisma.notification.deleteMany({ where: { id: { in: toDelete } } });
    }

    if (toUpdate.length > 0) {
      await prisma.notificationActor.deleteMany({
        where: { notificationId: { in: toUpdate }, userId: args.actorUserId },
      });
    }
  } catch (error) {
    console.error('Failed to remove like notification', {
      actorUserId: args.actorUserId,
      error,
    });
  }
}

export async function createLetterReplyNotification(args: {
  replyId: string;
  letterId: string;
  actorUserId: string;
  actorName: string;
  recipientUserId: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        user: { connect: { id: args.recipientUserId } },
        type: NotificationType.LETTER_REPLY,
        actors: { create: { userId: args.actorUserId } },
        reply: { connect: { id: args.replyId } },
      },
    });

    sendPushNotificationsToUser(args.recipientUserId, {
      title: args.actorName,
      body: 'Replied to your letter',
      url: `/letters/${args.letterId}`,
    }).catch(() => {});
  } catch (error) {
    console.error('Failed to create letter reply notification', {
      replyId: args.replyId,
      actorUserId: args.actorUserId,
      error,
    });
  }
}

export async function removeLetterReplyNotifications(args: {
  replyId: string;
  recipientIds: string[];
}): Promise<void> {
  if (args.recipientIds.length === 0) return;

  try {
    await prisma.notification.deleteMany({
      where: { userId: { in: args.recipientIds }, replyId: args.replyId },
    });
  } catch (error) {
    console.error('Failed to remove letter reply notifications', {
      replyId: args.replyId,
      error,
    });
  }
}

export async function notifyStaffPendingLetter(args: {
  letterId: string;
  submitterId?: string;
}): Promise<void> {
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'moderator'] },
        ...(args.submitterId && { id: { not: args.submitterId } }),
      },
      select: { id: true },
    });

    if (staffUsers.length === 0) return;

    await prisma.notification.createMany({
      data: staffUsers.map((user) => ({
        userId: user.id,
        type: NotificationType.LETTER_PENDING_REVIEW,
        letterId: args.letterId,
      })),
    });

    staffUsers.forEach((staffUser) => {
      sendPushNotificationsToUser(staffUser.id, {
        title: 'Letter Pending Review',
        body: 'A new letter is waiting for your review',
        url: '/admin/letters',
      }).catch(() => {});
    });
  } catch (error) {
    console.error('Failed to create notifications for pending letter', {
      letterId: args.letterId,
      error,
    });
  }
}
