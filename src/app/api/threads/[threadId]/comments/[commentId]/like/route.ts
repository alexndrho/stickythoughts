import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { NotificationType, Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NOTIFICATION_UPDATE_INTERVAL_MS } from "@/config/user";
import type IError from "@/types/error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string; commentId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "auth/unauthorized",
              message: "You must be logged in to like a post",
            },
          ],
        } satisfies IError,
        { status: 401 },
      );
    }

    const { threadId, commentId } = await params;

    const commentLike = await prisma.threadCommentLike.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        comment: {
          connect: {
            id: commentId,
            threadId: threadId,
          },
        },
      },
      select: {
        userId: true,
        comment: {
          select: {
            authorId: true,
            notifications: {
              take: 1,
              where: {
                type: NotificationType.THREAD_COMMENT_LIKE,
                updatedAt: {
                  gte: new Date(Date.now() - NOTIFICATION_UPDATE_INTERVAL_MS),
                },
              },
              select: { id: true },
              orderBy: {
                updatedAt: "desc",
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
    });

    if (commentLike.comment.authorId !== commentLike.userId) {
      if (commentLike.comment.notifications.length > 0) {
        await prisma.notification.update({
          where: { id: commentLike.comment.notifications[0].id },
          data: {
            isRead: false,
            isCountDecremented: false,
            actors: {
              create: { userId: commentLike.userId },
            },
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            user: { connect: { id: commentLike.comment.authorId } },
            type: NotificationType.THREAD_COMMENT_LIKE,
            actors: { create: { userId: commentLike.userId } },
            comment: { connect: { id: commentId } },
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Comment liked successfully",
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
                message: "You have already liked this comment",
              },
            ],
          } satisfies IError,
          { status: 400 },
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

  { params }: { params: Promise<{ threadId: string; commentId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "auth/unauthorized",
              message: "You must be logged in to like a post",
            },
          ],
        } satisfies IError,
        { status: 401 },
      );
    }

    const { threadId, commentId } = await params;

    const deletedLike = await prisma.threadCommentLike.delete({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
        AND: {
          comment: {
            threadId,
          },
        },
      },
      select: {
        userId: true,
        comment: {
          select: {
            authorId: true,
            thread: {
              select: {
                authorId: true,
              },
            },
            notifications: {
              where: {
                type: NotificationType.THREAD_COMMENT_LIKE,
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

    if (deletedLike.comment.authorId !== deletedLike.userId) {
      const notificationsToDelete = deletedLike.comment.notifications
        .filter((n) => n._count.actors <= 1)
        .map((n) => n.id);
      const notificationsToUpdate = deletedLike.comment.notifications
        .filter((n) => n._count.actors > 1)
        .map((n) => n.id);

      // Delete notifications with only 1 actor
      if (notificationsToDelete.length > 0) {
        await prisma.notification.deleteMany({
          where: { id: { in: notificationsToDelete } },
        });
      }
      // Remove the actor from notifications with multiple actors
      if (notificationsToUpdate.length > 0) {
        await prisma.notificationActor.deleteMany({
          where: {
            notificationId: { in: notificationsToUpdate },
            userId: deletedLike.userId,
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Comment unliked successfully",
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
                message: "You have not liked this comment",
              },
            ],
          } satisfies IError,
          { status: 400 },
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
