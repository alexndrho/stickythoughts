import { headers } from "next/headers";
import { NextResponse } from "next/server";

import type { UserSettingsPrivacy } from "@/types/user";
import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse } from "@/lib/http";
import { getUserPrivacySettings } from "@/server/user";

export async function GET() {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const privacySettings = await getUserPrivacySettings({
      userId: session.user.id,
    });

    return NextResponse.json(
      (privacySettings ?? null) satisfies UserSettingsPrivacy,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
