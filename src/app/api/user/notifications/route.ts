import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { formatUserNotifications } from "@/utils/user";
import { NOTIFICATION_PER_PAGE } from "@/config/user";
import type IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lastUpdatedAt = searchParams.get("lastUpdatedAt");

  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
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
        letter: {
          select: {
            id: true,
            title: true,
          },
        },
        reply: {
          select: {
            id: true,
            body: true,
            isAnonymous: true,
            letter: {
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
