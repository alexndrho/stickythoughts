import { NextResponse } from "next/server";

import { jsonError, unknownErrorResponse } from "@/lib/http";
import { purgeAnonymousUsers } from "@/server/cron";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return jsonError(
        [
          {
            code: "config/missing-cron-secret",
            message: "CRON_SECRET is not configured",
          },
        ],
        500,
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return jsonError(
        [{ code: "auth/unauthorized", message: "Unauthorized" }],
        401,
      );
    }

    const result = await purgeAnonymousUsers({
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    });

    return NextResponse.json(
      {
        checkedAt: result.checkedAt.toISOString(),
        cutoffAt: result.cutoffAt.toISOString(),
        deleted: result.deletedUsers,
        profileImagesDeleted: result.profileImagesDeleted,
        profileImagesFailed: result.profileImagesFailed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
