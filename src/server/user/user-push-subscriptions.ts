import 'server-only';

import { prisma } from '@/lib/db';
import { webpush } from '@/lib/web-push';

export async function saveUserPushSubscription(
  userId: string,
  subscription: { endpoint: string; p256dh: string; auth: string },
) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  });
}

export async function deleteUserPushSubscription(userId: string, endpoint: string) {
  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function sendPushNotificationsToUser(
  userId: string,
  payload: { title: string; body: string; url: string },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushSubscriptions: true },
  });

  if (!user?.pushSubscriptions.length) return;

  await Promise.allSettled(
    user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await deleteUserPushSubscription(userId, sub.endpoint);
        }
      }
    }),
  );
}
