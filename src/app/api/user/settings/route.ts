import { headers } from "next/headers";
import { NextResponse } from "next/server";

import type { UserAccountSettings } from "@/types/user";
import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import { getUserAccountSettings } from "@/server/user";
import { UserNotFoundError } from "@/server/user";

export async function GET() {
  const session = await guardSession({ headers: await headers() });

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const userSettings: UserAccountSettings = await getUserAccountSettings({
      userId: session.user.id,
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: "not-found", message: "User not found" }], 404);
    }

    console.error("Error fetching user:", error);
    return unknownErrorResponse("Unknown error");
  }
}
