import { Prisma } from '@/generated/prisma/client';
import type { input } from 'zod';
import type {
  updateUserBioInput,
  updateUserLikesVisibilityInput,
  userNotificationMarkReadInput,
  userNotificationOpenedInput,
} from '@/lib/validations/user';
import type { SerializeDates } from './serialization';

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

export type UserPublicAccount = Omit<BaseUserPublicAccount, 'settings' | 'banned'> & {
  isLikesPrivate: boolean;
  banned?: BaseUserPublicAccount['banned'];
};

export type UserPublicAccountDTO = SerializeDates<UserPublicAccount>;

export type UserAccountSettings = Prisma.UserGetPayload<{
  select: {
    bio: true;
  };
}>;

export type UserAccountSettingsDTO = SerializeDates<UserAccountSettings>;

type BaseUserSettingsPrivacy = Prisma.UserSettingsGetPayload<{
  select: {
    privacySettings: {
      select: { likesVisibility: true };
    };
  };
}>;

export type UserSettingsPrivacy = BaseUserSettingsPrivacy['privacySettings'];

export type UserSettingsPrivacyDTO = SerializeDates<UserSettingsPrivacy>;

export type BaseUserNotification = Prisma.NotificationGetPayload<{
  select: {
    id: true;
    type: true;
    isRead: true;
    lastActivityAt: true;
    letter: {
      select: {
        id: true;
        recipient: true;
        body: true;
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

export type UserNotification = Pick<BaseUserNotification, 'id' | 'type' | 'isRead'> & {
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
  lastActivityAt: Date;
};

export type UserNotificationDTO = SerializeDates<UserNotification>;

export type UserSummary = {
  id: string;
  name: string | null;
  username: string;
};

export type UserWithAvatarSummary = UserSummary & {
  image: string | null;
};

export type UpdateUserBioBody = input<typeof updateUserBioInput>;
export type UpdateUserLikesVisibilityBody = input<typeof updateUserLikesVisibilityInput>;
export type UserNotificationOpenedBody = input<typeof userNotificationOpenedInput>;
export type UserNotificationMarkReadBody = input<typeof userNotificationMarkReadInput>;
