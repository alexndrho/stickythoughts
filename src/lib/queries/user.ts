import "server-only";

import { prisma } from "@/lib/db";
import type { UserPublicAccount } from "@/types/user";

export class UserNotFoundError extends Error {
  name = "UserNotFoundError";
}

export async function getUserPublicAccount(args: {
  username: string;
  canSeeBanned: boolean;
}): Promise<UserPublicAccount> {
  const normalizedUsername = args.username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      id: true,
      displayUsername: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      // Only staff should see this field; omit entirely otherwise.
      banned: args.canSeeBanned,
      settings: {
        select: {
          privacySettings: {
            select: {
              likesVisibility: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UserNotFoundError("User not found");
  }

  const { settings, ...userRest } = user;

  return {
    ...userRest,
    isLikesPrivate: settings?.privacySettings?.likesVisibility === "PRIVATE",
  } satisfies UserPublicAccount;
}

