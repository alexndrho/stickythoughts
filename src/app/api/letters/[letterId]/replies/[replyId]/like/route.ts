import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { NotificationType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { NOTIFICATION_UPDATE_INTERVAL_MS } from "@/config/user";
import type IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    const replyStatus = await prisma.letterReply.findUnique({
      where: { id: replyId },
      select: {
        letterId: true,
        deletedAt: true,
        letter: {
          select: {
            deletedAt: true,
          },
        },
      },
    });

    if (
      !replyStatus ||
      replyStatus.letterId !== letterId ||
      replyStatus.deletedAt ||
      replyStatus.letter.deletedAt
    ) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Reply not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    const replyLike = await prisma.letterReplyLike.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        reply: {
          connect: {
            id: replyId,
            letterId: letterId,
          },
        },
      },
      select: {
        userId: true,
        reply: {
          select: {
            authorId: true,
            notifications: {
              take: 1,
              where: {
                type: NotificationType.LETTER_REPLY_LIKE,
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

    if (replyLike.reply.authorId !== replyLike.userId) {
      if (replyLike.reply.notifications.length > 0) {
        await prisma.notification.update({
          where: { id: replyLike.reply.notifications[0].id },
          data: {
            isRead: false,
            isCountDecremented: false,
            actors: {
              create: { userId: replyLike.userId },
            },
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            user: { connect: { id: replyLike.reply.authorId } },
            type: NotificationType.LETTER_REPLY_LIKE,
            actors: { create: { userId: replyLike.userId } },
            reply: { connect: { id: replyId } },
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Reply liked successfully",
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
                message: "You have already liked this reply",
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

  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    const replyStatus = await prisma.letterReply.findUnique({
      where: { id: replyId },
      select: {
        letterId: true,
        deletedAt: true,
        letter: {
          select: {
            deletedAt: true,
          },
        },
      },
    });

    if (
      !replyStatus ||
      replyStatus.letterId !== letterId ||
      replyStatus.deletedAt ||
      replyStatus.letter.deletedAt
    ) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Reply not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    const deletedLike = await prisma.letterReplyLike.delete({
      where: {
        userId_replyId: {
          userId: session.user.id,
          replyId,
        },
        AND: {
          reply: {
            letterId,
          },
        },
      },
      select: {
        userId: true,
        reply: {
          select: {
            authorId: true,
            letter: {
              select: {
                authorId: true,
              },
            },
            notifications: {
              where: {
                type: NotificationType.LETTER_REPLY_LIKE,
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

    if (deletedLike.reply.authorId !== deletedLike.userId) {
      const notificationsToDelete = deletedLike.reply.notifications
        .filter((n) => n._count.actors <= 1)
        .map((n) => n.id);
      const notificationsToUpdate = deletedLike.reply.notifications
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
        message: "Reply unliked successfully",
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
                message: "You have not liked this reply",
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
