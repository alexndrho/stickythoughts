import type {
  BaseUserNotificationType,
  UserNotificationType,
} from "@/types/user";

export function formatUserNotifications(
  notifications: BaseUserNotificationType[],
): UserNotificationType[] {
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
      case "THREAD_LIKE": {
        body = notification.thread?.title || "";
        break;
      }
      case "THREAD_COMMENT_LIKE": {
        body = notification.comment?.body || "";
        break;
      }
      case "THREAD_COMMENT": {
        body = notification.comment?.body || "";
        if (notification.comment?.isAnonymous) {
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
      threadId: notification.thread?.id || notification.comment?.thread?.id,
      commentId: notification.comment?.id,
      body,
      isRead: notification.isRead,
      updatedAt: notification.updatedAt.toISOString(),
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
