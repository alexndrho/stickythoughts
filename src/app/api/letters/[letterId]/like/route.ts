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
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;
    const letterStatus = await prisma.letter.findUnique({
      where: { id: letterId },
      select: { deletedAt: true },
    });

    if (!letterStatus || letterStatus.deletedAt) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Letter post not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    const letterLike = await prisma.letterLike.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        letter: {
          connect: {
            id: letterId,
          },
        },
      },
      select: {
        userId: true,
        letter: {
          select: {
            authorId: true,
            notifications: {
              take: 1,
              where: {
                type: NotificationType.LETTER_LIKE,
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

    if (letterLike.letter.authorId !== letterLike.userId) {
      if (letterLike.letter.notifications.length > 0) {
        await prisma.notification.update({
          where: {
            id: letterLike.letter.notifications[0].id,
          },
          data: {
            isRead: false,
            isCountDecremented: false,
            actors: {
              create: {
                userId: letterLike.userId,
              },
            },
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            user: { connect: { id: letterLike.letter.authorId } },
            type: NotificationType.LETTER_LIKE,
            letter: { connect: { id: letterId } },
            actors: {
              create: {
                userId: letterLike.userId,
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
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;

    const deletedLetterLike = await prisma.letterLike.delete({
      where: {
        userId_letterId: {
          userId: session.user.id,
          letterId,
        },
      },
      select: {
        userId: true,
        letter: {
          select: {
            authorId: true,
            notifications: {
              where: {
                type: NotificationType.LETTER_LIKE,
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

    if (deletedLetterLike.letter.authorId !== deletedLetterLike.userId) {
      const notificationsToDelete = deletedLetterLike.letter.notifications
        .filter((notification) => notification._count.actors <= 1)
        .map((notification) => notification.id);
      const notificationsToUpdate = deletedLetterLike.letter.notifications
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
            userId: deletedLetterLike.userId,
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
