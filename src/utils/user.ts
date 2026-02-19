import type { BaseUserNotification, UserNotification } from "@/types/user";

export function formatUserNotifications(
  notifications: BaseUserNotification[],
): UserNotification[] {
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
    let body = "You have a new notification";

    switch (notification.type) {
      case "LETTER_LIKE": {
        body = notification.letter?.title || "";
        break;
      }
      case "LETTER_REPLY_LIKE": {
        body = notification.reply?.body || "";
        break;
      }
      case "LETTER_REPLY": {
        body = notification.reply?.body || "";
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
    }

    return {
      id: notification.id,
      type: notification.type,
      mainActor,
      otherActorCount: (notification._count?.actors ?? 1) - 1,
      letterId: notification.letter?.id || notification.reply?.letter?.id,
      replyId: notification.reply?.id,
      body,
      isRead: notification.isRead,
      updatedAt: notification.updatedAt,
    };
  });
}

export const formatUserDisplayName = (user: {
  name?: string | null;
  username: string;
}) => {
  const name = user.name?.trim() || "";
  const username = user.username?.trim() || "";

  if (name && username) return `${name} (@${username})`;
  if (username) return `@${username}`;
  if (name) return name;

  return "";
};
