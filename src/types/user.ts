import { Prisma } from "@/generated/prisma/client";

export type BaseUserPublicAccount = Prisma.UserGetPayload<{
  select: {
    id: true;
    displayUsername: true;
    name: true;
    username: true;
    bio: true;
    image: true;
    banned: true;
    settings: {
      select: {
        privacySettings: {
          select: {
            likesVisibility: true;
          };
        };
      };
    };
  };
}>;

export type UserPublicAccount = Omit<
  BaseUserPublicAccount,
  "settings" | "banned"
> & {
  isLikesPrivate: boolean;
  banned?: BaseUserPublicAccount["banned"];
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
    letter: {
      select: {
        id: true;
        title: true;
      };
    };
    reply: {
      select: {
        id: true;
        body: true;
        isAnonymous: true;
        letter: {
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
  letterId: string | undefined;
  replyId: string | undefined;
  body: string;
  updatedAt: Date;
};
