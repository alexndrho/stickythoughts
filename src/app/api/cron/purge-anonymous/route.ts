import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { hasActiveSession } from "@/lib/has-active-session";
import { deleteFile, isUrlStorage } from "@/lib/storage";
import { ONE_WEEK_MS } from "@/config/cron";
import { extractKeyFromUrl } from "@/utils/text";
import type IError from "@/types/error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "config/missing-cron-secret",
              message: "CRON_SECRET is not configured",
            },
          ],
        } satisfies IError,
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
        } satisfies IError,
        { status: 401 },
      );
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - ONE_WEEK_MS);

    // 1) Fetch anonymous users with no active (non-deleted) content
    //    and older than the hiccup buffer.
    const candidates = await prisma.user.findMany({
      where: {
        isAnonymous: true,
        createdAt: { lte: cutoff },
        letters: { none: { deletedAt: null } },
        letterReplies: { none: { deletedAt: null } },
      },
      select: { id: true, image: true, createdAt: true },
    });

    // 2) Check for active sessions. Any error => treat as active (safer).
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

    // 3) Delete users and remove stored profile images.
    const deleted =
      candidateIds.length > 0
        ? await prisma.user.deleteMany({
            where: { id: { in: candidateIds } },
          })
        : { count: 0 };

    const imageUrls = deletableUsers
      .map((user) => user.image)
      .filter((image): image is string => Boolean(image));

    const imageDeleteResults = await Promise.allSettled(
      imageUrls
        .filter((image) => isUrlStorage(image))
        .map((image) =>
          deleteFile({
            params: {
              Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
              Key: extractKeyFromUrl(image),
            },
          }),
        ),
    );

    const profileImagesDeleted = imageDeleteResults.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const profileImagesFailed =
      imageDeleteResults.length - profileImagesDeleted;

    if (profileImagesFailed > 0) {
      const failures = imageDeleteResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        )
        .map((result) => result.reason);
      console.error("Failed to delete some profile images:", failures);
    }

    return NextResponse.json(
      {
        checkedAt: now.toISOString(),
        cutoffAt: cutoff.toISOString(),
        deleted: deleted.count,
        profileImagesDeleted,
        profileImagesFailed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
  }
}
