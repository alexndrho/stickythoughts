import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type { UserPublicAccount } from "@/types/user";
import IError from "@/types/error";
import { getUserPublicAccount, UserNotFoundError } from "@/lib/queries/user";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const normalizedUsername = username.toLowerCase();

    const session = await auth.api.getSession({
      headers: await headers(),
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
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: `User not found`,
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
