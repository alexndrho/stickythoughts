import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import type { UserPublicAccount } from "@/types/user";
import IError from "@/types/error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const user: UserPublicAccount | null = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        displayUsername: true,
        name: true,
        username: true,
        bio: true,
        image: true,
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

    return NextResponse.json(user);
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
