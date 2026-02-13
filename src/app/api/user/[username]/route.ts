import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type { UserPublicAccount } from "@/types/user";
import { getUserPublicAccount, UserNotFoundError } from "@/server/user";
import { jsonError, unknownErrorResponse } from "@/lib/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const normalizedUsername = username.toLowerCase();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const hasPermissionToBan = session
      ? (
          await auth.api.userHasPermission({
            body: {
              userId: session.user.id,
              permission: {
                user: ["ban"],
              },
            },
          })
        ).success
      : false;

    const user = await getUserPublicAccount({
      username: normalizedUsername,
      canSeeBanned: hasPermissionToBan,
    });

    return NextResponse.json(user satisfies UserPublicAccount);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: "not-found", message: "User not found" }], 404);
    }

    console.error("Error fetching user:", error);
    return unknownErrorResponse("Unknown error");
  }
}
