import type {
  BaseUserNotificationType,
  UserNotificationType,
} from "@/types/user";

export function formatUserNotifications(
  notifications: BaseUserNotificationType[],
): UserNotificationType[] {
  return notifications.map((notification) => {
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
        break;
      }
    }

    const firstActor = notification.actors?.[0]?.user;
    return {
      id: notification.id,
      type: notification.type,
      actorImage: firstActor?.image,
      actorName: firstActor?.name,
      actorUsername: firstActor?.username,
      otherActorCount: (notification._count?.actors ?? 1) - 1,
      threadId: notification.thread?.id || notification.comment?.thread?.id,
      commentId: notification.comment?.id,
      body,
      isRead: notification.isRead,
      updatedAt: notification.updatedAt.toISOString(),
    };
  });
}
