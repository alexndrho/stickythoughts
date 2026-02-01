import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import IError from "@/types/error";
import type { UserAccountSettings } from "@/types/user";
import { guardSession } from "@/lib/session-guard";

export async function GET() {
  const session = await guardSession({ headers: await headers() });

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const userSettings: UserAccountSettings | null =
      await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          bio: true,
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
