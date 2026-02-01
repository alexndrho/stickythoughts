import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { NotificationType } from "@/generated/prisma/client";
import { NOTIFICATION_UPDATE_INTERVAL_MS } from "@/config/user";
import type IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { threadId } = await params;
    const threadStatus = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { deletedAt: true },
    });

    if (!threadStatus || threadStatus.deletedAt) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Thread post not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    const threadLike = await prisma.threadLike.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        thread: {
          connect: {
            id: threadId,
          },
        },
      },
      select: {
        userId: true,
        thread: {
          select: {
            authorId: true,
            notifications: {
              take: 1,
              where: {
                type: NotificationType.THREAD_LIKE,
                updatedAt: {
                  gte: new Date(Date.now() - NOTIFICATION_UPDATE_INTERVAL_MS),
                },
              },
              select: { id: true },
              orderBy: {
                updatedAt: "desc",
              },
            },
          },
        },
      },
    });

    if (threadLike.thread.authorId !== threadLike.userId) {
      if (threadLike.thread.notifications.length > 0) {
        await prisma.notification.update({
          where: {
            id: threadLike.thread.notifications[0].id,
          },
          data: {
            isRead: false,
            isCountDecremented: false,
            actors: {
              create: {
                userId: threadLike.userId,
              },
            },
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            user: { connect: { id: threadLike.thread.authorId } },
            type: NotificationType.THREAD_LIKE,
            thread: { connect: { id: threadId } },
            actors: {
              create: {
                userId: threadLike.userId,
              },
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Post liked successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            issues: [
              {
                code: "validation/unique-constraint",
                message: "You have already liked this post",
              },
            ],
          } satisfies IError,
          { status: 409 },
        );
      }
    }

    console.error(error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { threadId } = await params;

    const deletedThreadLike = await prisma.threadLike.delete({
      where: {
        userId_threadId: {
          userId: session.user.id,
          threadId,
        },
      },
      select: {
        userId: true,
        thread: {
          select: {
            authorId: true,
            notifications: {
              where: {
                type: NotificationType.THREAD_LIKE,
                actors: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
              select: {
                id: true,
                _count: {
                  select: {
                    actors: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (deletedThreadLike.thread.authorId !== deletedThreadLike.userId) {
      const notificationsToDelete = deletedThreadLike.thread.notifications
        .filter((notification) => notification._count.actors <= 1)
        .map((notification) => notification.id);
      const notificationsToUpdate = deletedThreadLike.thread.notifications
        .filter((notification) => notification._count.actors > 1)
        .map((notification) => notification.id);

      // Delete notifications with only 1 actor
      if (notificationsToDelete.length > 0) {
        await prisma.notification.deleteMany({
          where: {
            id: {
              in: notificationsToDelete,
            },
          },
        });
      }
      // Remove the actor from notifications with multiple actors
      if (notificationsToUpdate.length > 0) {
        await prisma.notificationActor.deleteMany({
          where: {
            notificationId: { in: notificationsToUpdate },
            userId: deletedThreadLike.userId,
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Post unliked successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            issues: [
              {
                code: "validation/unique-constraint",
                message: "You have not liked this post yet",
              },
            ],
          } satisfies IError,
          { status: 409 },
        );
      }
    }

    console.error(error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
