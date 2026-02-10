import "server-only";

import { prisma } from "@/lib/db";
import type { VisibilityLevel } from "@/generated/prisma/enums";
import { UserNotFoundError } from "@/server/user/user-errors";

export async function updateUserBio(args: { userId: string; bio: string }) {
  await prisma.user.update({
    where: { id: args.userId },
    data: { bio: args.bio },
  });
}

export async function clearUserBio(args: { userId: string }) {
  await prisma.user.update({
    where: { id: args.userId },
    data: { bio: null },
  });
}

export async function getUserAccountSettings(args: { userId: string }) {
  const userSettings = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { bio: true },
  });

  if (!userSettings) {
    throw new UserNotFoundError("User not found");
  }

  return userSettings;
}

export async function getUserPrivacySettings(args: { userId: string }) {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: args.userId },
    select: {
      privacySettings: {
        select: { likesVisibility: true },
      },
    },
  });

  return userSettings?.privacySettings ?? null;
}

export async function updateUserLikesVisibility(args: {
  userId: string;
  visibility: VisibilityLevel;
}) {
  const updatedUser = await prisma.user.update({
    where: { id: args.userId },
    data: {
      settings: {
        upsert: {
          update: {
            privacySettings: {
              upsert: {
                update: { likesVisibility: args.visibility },
                create: { likesVisibility: args.visibility },
              },
            },
          },
          create: {
            privacySettings: {
              create: { likesVisibility: args.visibility },
            },
          },
        },
      },
    },
    select: {
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

  return updatedUser.settings?.privacySettings ?? null;
}

export async function getUserProfileImage(args: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { image: true },
  });

  if (!user) {
    throw new UserNotFoundError("User not found");
  }

  return user.image;
}
