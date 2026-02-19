import { NextResponse, type NextRequest } from "next/server";

import { formatUserNotifications } from "@/utils/user";
import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse } from "@/lib/http";
import { listUserNotifications } from "@/server/user";
import { toDTO } from "@/lib/http/to-dto";
import type { UserNotificationDTO } from "@/types/user";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lastUpdatedAt = searchParams.get("lastUpdatedAt");

  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const notifications = await listUserNotifications({
      userId: session.user.id,
      lastUpdatedAt,
    });

    const formattedNotifications = formatUserNotifications(notifications);

    return NextResponse.json(
      toDTO(formattedNotifications) satisfies UserNotificationDTO[],
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
