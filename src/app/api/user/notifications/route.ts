import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { formatUserNotifications } from "@/utils/user";
import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse } from "@/lib/http";
import { listUserNotifications } from "@/server/user";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lastUpdatedAt = searchParams.get("lastUpdatedAt");

  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const notifications = await listUserNotifications({
      userId: session.user.id,
      lastUpdatedAt,
    });

    const formattedNotifications = formatUserNotifications(notifications);

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
