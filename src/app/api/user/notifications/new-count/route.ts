import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { userNotificationOpenedInput } from "@/lib/validations/user";
import type IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function GET() {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        _count: {
          select: {
            notifications: {
              where: {
                isCountDecremented: false,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "User not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    return NextResponse.json({
      count: user._count.notifications,
    });
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

export async function PUT(req: Request) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { opened } = userNotificationOpenedInput.parse(await req.json());

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        notifications: {
          updateMany: {
            where: { isCountDecremented: false },
            data: { isCountDecremented: opened },
          },
        },
      },
    });

    return NextResponse.json({ message: "Notifications updated successfully" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
