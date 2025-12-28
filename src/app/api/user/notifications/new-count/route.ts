import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userNotificationOpenedInput } from "@/lib/validations/user";
import type IError from "@/types/error";

export async function GET() {
  try {
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
