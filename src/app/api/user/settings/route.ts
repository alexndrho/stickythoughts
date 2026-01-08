import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import IError from "@/types/error";
import type { UserAccountSettings } from "@/types/user";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 },
    );
  }

  try {
    const userSettings: UserAccountSettings | null =
      await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        omit: {
          id: true,
          name: true,
          displayUsername: true,
          username: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!userSettings) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "User not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    return NextResponse.json(userSettings);
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
