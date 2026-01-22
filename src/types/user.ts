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
}> & {
  isLikesPrivate: boolean;
};

export type UserAccountSettings = Prisma.UserGetPayload<{
  select: {
    bio: true;
  };
}>;

type BaseUserSettingsPrivacy = Prisma.UserSettingsGetPayload<{
  select: {
    privacySettings: {
      select: { likesVisibility: true };
    };
  };
}>;

export type UserSettingsPrivacy = BaseUserSettingsPrivacy["privacySettings"];

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
        isAnonymous: true;
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
  mainActor: {
    image: string | null;
    name: string | null;
    username: string | null;
    isAnonymous?: boolean;
  };
  otherActorCount: number;
  threadId: string | undefined;
  commentId: string | undefined;
  body: string;
  updatedAt: string;
};
