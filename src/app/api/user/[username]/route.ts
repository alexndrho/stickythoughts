import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { UserPublicAccount } from "@/types/user";
import IError from "@/types/error";

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
        banned: hasPermissionToBan,
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

    const { settings, ...userRest } = user;

    return NextResponse.json({
      ...userRest,
      isLikesPrivate: settings?.privacySettings?.likesVisibility === "PRIVATE",
    } satisfies UserPublicAccount);
  } catch (error) {
    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
