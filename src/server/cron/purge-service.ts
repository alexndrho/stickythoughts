import "server-only";

import { prisma } from "@/lib/db";
import { hasActiveSession } from "@/lib/has-active-session";
import { deleteFile, isUrlStorage } from "@/lib/storage";
import { ONE_WEEK_MS } from "@/config/cron";
import { extractUserProfileImageKeyFromUrl } from "@/utils/text";
import { subMonths } from "date-fns";

export async function purgeSoftDeletedContent() {
  const cutoff = subMonths(new Date(), 1);

  const [replies, letters, thoughts] = await prisma.$transaction([
    prisma.letterReply.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
    prisma.letter.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
    prisma.thought.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
  ]);

  return {
    cutoff,
    deleted: {
      replies: replies.count,
      letters: letters.count,
      thoughts: thoughts.count,
    },
  };
}

export async function purgeAnonymousUsers(args: {
  now?: Date;
  bucketName?: string;
}) {
  const now = args.now ?? new Date();
  const cutoff = new Date(now.getTime() - ONE_WEEK_MS);

  // 1) Fetch anonymous users with no active (non-deleted) content.
  const candidates = await prisma.user.findMany({
    where: {
      isAnonymous: true,
      createdAt: { lte: cutoff },
      letters: { none: { deletedAt: null } },
      letterReplies: { none: { deletedAt: null } },
    },
    select: { id: true, image: true, createdAt: true },
  });

  const sessionChecks = await Promise.all(
    candidates.map(async (user) => {
      const sessionResult = await hasActiveSession(user.id, now);
      return { user, sessionResult };
    }),
  );

  const deletableUsers = [];
  for (const { user, sessionResult } of sessionChecks) {
    if (!sessionResult.hasActiveSession) {
      deletableUsers.push(user);
    }
  }

  const candidateIds = deletableUsers.map((user) => user.id);

  const deleted =
    candidateIds.length > 0
      ? await prisma.user.deleteMany({
          where: { id: { in: candidateIds } },
        })
      : { count: 0 };

  const imageDeleteTargets = deletableUsers
    .filter((user) => Boolean(user.image) && isUrlStorage(user.image!))
    .map((user) => {
      const key = extractUserProfileImageKeyFromUrl(user.image!, user.id);
      if (!key) {
        console.error(
          "Refusing to delete profile image during purge: key does not match expected prefix.",
          { userId: user.id },
        );
        return null;
      }
      return { userId: user.id, key };
    })
    .filter(
      (target): target is { userId: string; key: string } => target !== null,
    );

  const imageDeleteResults = await Promise.allSettled(
    imageDeleteTargets.map((t) =>
      deleteFile({
        params: {
          Bucket: args.bucketName,
          Key: t.key,
        },
      }),
    ),
  );

  const profileImagesDeleted = imageDeleteResults.filter(
    (result) => result.status === "fulfilled",
  ).length;
  const profileImagesFailed = imageDeleteResults.length - profileImagesDeleted;

  if (profileImagesFailed > 0) {
    const failures = imageDeleteResults
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )
      .map((result) => result.reason);
    console.error("Failed to delete some profile images:", failures);
  }

  return {
    checkedAt: now,
    cutoffAt: cutoff,
    deletedUsers: deleted.count,
    profileImagesDeleted,
    profileImagesFailed,
  };
}

