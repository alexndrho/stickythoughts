import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUserNotifications } from "@/utils/user";
import { NOTIFICATION_PER_PAGE } from "@/config/user";
import type IError from "@/types/error";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lastUpdatedAt = searchParams.get("lastUpdatedAt");

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

    const notifications = await prisma.notification.findMany({
      take: NOTIFICATION_PER_PAGE,
      where: {
        userId: session.user.id,
        updatedAt: {
          lt: lastUpdatedAt ? new Date(lastUpdatedAt) : undefined,
        },
      },
      select: {
        id: true,
        type: true,
        isRead: true,
        updatedAt: true,
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
            isAnonymous: true,
            thread: {
              select: {
                id: true,
              },
            },
          },
        },
        actors: {
          take: 1,
          select: {
            user: {
              select: {
                image: true,
                name: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            actors: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedNotifications = formatUserNotifications(notifications);

    return NextResponse.json(formattedNotifications);
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
