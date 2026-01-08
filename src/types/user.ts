import { Prisma } from "@/generated/prisma/client";

export type UserPublicAccount = Prisma.UserGetPayload<{
  select: {
    id: true;
    displayUsername: true;
    name: true;
    username: true;
    bio: true;
    image: true;
  };
}>;

export type UserAccountSettings = Prisma.UserGetPayload<{
  omit: {
    id: true;
    name: true;
    displayUsername: true;
    username: true;
    email: true;
    emailVerified: true;
    image: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type BaseUserNotificationType = Prisma.NotificationGetPayload<{
  select: {
    id: true;
    type: true;
    isRead: true;
    updatedAt: true;
    thread: {
      select: {
        id: true;
        title: true;
      };
    };
    comment: {
      select: {
        id: true;
        body: true;
        thread: {
          select: {
            id: true;
          };
        };
      };
    };
    actors: {
      take: 1;
      select: {
        user: {
          select: {
            image: true;
            name: true;
            username: true;
          };
        };
      };
    };
    _count: {
      select: {
        actors: true;
      };
    };
  };
}>;

export type UserNotificationType = Pick<
  BaseUserNotificationType,
  "id" | "type" | "isRead"
> & {
  actorImage: string | null;
  actorName: string;
  actorUsername: string;
  otherActorCount: number;
  threadId: string | undefined;
  commentId: string | undefined;
  body: string;
  updatedAt: string;
};
