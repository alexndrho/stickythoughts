import type { BaseUserNotification, UserNotification } from '@/types/user';

const NOTIFICATION_BODY_PREVIEW_MAX_LENGTH = 120;

function toNotificationPreview(text?: string | null) {
  const plainText = (text || '').trim();
  if (!plainText) return '';

  if (plainText.length <= NOTIFICATION_BODY_PREVIEW_MAX_LENGTH) {
    return plainText;
  }

  return `${plainText.slice(0, NOTIFICATION_BODY_PREVIEW_MAX_LENGTH - 1).trimEnd()}…`;
}

export function formatUserNotifications(notifications: BaseUserNotification[]): UserNotification[] {
  return notifications.map((notification) => {
    const firstActor = notification.actors?.[0]?.user;
    let mainActor: {
      image: string | null;
      name: string | null;
      username: string | null;
      isAnonymous?: boolean;
    } = {
      image: firstActor?.image || null,
      name: firstActor?.name || null,
      username: firstActor?.username || null,
      isAnonymous: false,
    };
    let body = 'You have a new notification';

    switch (notification.type) {
      case 'LETTER_LIKE': {
        body =
          toNotificationPreview(notification.letter?.body) || notification.letter?.recipient || '';
        break;
      }
      case 'LETTER_REPLY_LIKE': {
        body = toNotificationPreview(notification.reply?.body);
        break;
      }
      case 'LETTER_REPLY': {
        body = toNotificationPreview(notification.reply?.body);
        if (notification.reply?.isAnonymous) {
          mainActor = {
            image: null,
            name: null,
            username: null,
            isAnonymous: true,
          };
        }
        break;
      }
      case 'LETTER_PENDING_REVIEW': {
        body =
          toNotificationPreview(notification.letter?.body) ||
          notification.letter?.recipient ||
          'A new letter is awaiting review.';

        if (!firstActor) {
          mainActor = {
            image: null,
            name: null,
            username: null,
            isAnonymous: true,
          };
        }
        break;
      }
    }

    return {
      id: notification.id,
      type: notification.type,
      mainActor,
      otherActorCount: Math.max((notification._count?.actors ?? 0) - 1, 0),
      letterId: notification.letter?.id || notification.reply?.letter?.id,
      replyId: notification.reply?.id,
      body,
      isRead: notification.isRead,
      lastActivityAt: notification.lastActivityAt,
    };
  });
}

export const formatUserDisplayName = (user: { name?: string | null; username: string }) => {
  const name = user.name?.trim() || '';
  const username = user.username?.trim() || '';

  if (name && username) return `${name} (@${username})`;
  if (username) return `@${username}`;
  if (name) return name;

  return '';
};
