import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { userNotificationMarkReadInput } from "@/lib/validations/user";
import IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

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

    await prisma.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead },
    });

    return NextResponse.json({ message: "Notification updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        issues: error.issues.map((issue) => ({
          code: "validation/invalid-input",
          message: issue.message,
        })),
      };

      return NextResponse.json(zodError, { status: 400 });
    }

    console.error(error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 },
    );
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

    await prisma.notification.delete({
      where: { id: notificationId, userId: session.user.id },
    });

    return NextResponse.json({ message: "Notification deleted successfully" });
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
