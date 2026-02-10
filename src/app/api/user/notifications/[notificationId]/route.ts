import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { userNotificationMarkReadInput } from "@/lib/validations/user";
import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import {
  deleteNotification,
  markNotificationRead,
} from "@/server/user";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { isRead } = userNotificationMarkReadInput.parse(await req.json());

    await markNotificationRead({
      notificationId,
      userId: session.user.id,
      isRead,
    });

    return NextResponse.json({ message: "Notification updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    await deleteNotification({ notificationId, userId: session.user.id });

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
