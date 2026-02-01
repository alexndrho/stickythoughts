import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import IError from "@/types/error";
import type { UserSettingsPrivacy } from "@/types/user";
import { guardSession } from "@/lib/session-guard";

export async function GET() {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        privacySettings: {
          select: { likesVisibility: true },
        },
      },
    });

    return NextResponse.json(
      (userSettings?.privacySettings ?? null) satisfies UserSettingsPrivacy,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
