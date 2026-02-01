import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import IError from "@/types/error";
import { updateThreadServerInput } from "@/lib/validations/thread";
import type { ThreadType } from "@/types/thread";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { threadId } = await params;

    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        likes: session
          ? {
              where: {
                userId: session.user.id,
              },
              select: {
                userId: true,
              },
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!thread || thread.deletedAt) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Thread post not found",
            },
          ],
        } satisfies IError,
        {
          status: 404,
        },
      );
    }

    const { likes, _count, authorId, ...restThread } = thread;

    const formattedPost: ThreadType = {
      ...restThread,
      author: restThread.isAnonymous ? undefined : restThread.author,
      isOwner: session?.user?.id === authorId,
      likes: {
        liked: !!likes?.length,
        count: _count.likes,
      },
      comments: {
        count: _count.comments,
      },
    } satisfies ThreadType;

    return NextResponse.json(formattedPost);
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const { threadId } = await params;
    const { body } = updateThreadServerInput.parse(await request.json());

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

    const updateResult = await prisma.thread.update({
      where: {
        id: threadId,
        authorId: session.user.id,
        deletedAt: null,
      },
      data: {
        body,
      },
      select: {
        id: true,
        title: true,
        body: true,
        authorId: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    const { authorId, ...restThread } = updateResult;

    const formattedThread: ThreadType = {
      ...restThread,
      author: restThread.isAnonymous ? undefined : restThread.author,
      isOwner: session.user.id === authorId,
      likes: {
        liked: false,
        count: 0,
      },
      comments: {
        count: 0,
      },
    } satisfies ThreadType;

    return NextResponse.json(formattedThread);
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        issues: error.issues.map((issue) => ({
          code: "validation/invalid-input",
          message: issue.message,
        })),
      };

      return NextResponse.json(zodError, { status: 400 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
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
    const { threadId } = await params;

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

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          thread: ["delete"],
        },
      },
    });

    await prisma.thread.update({
      where: {
        id: threadId,
        deletedAt: null,
        ...(hasPermission.success ? {} : { authorId: session.user.id }),
      },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Thread post deleted",
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
                code: "not-found",
                message: "Thread post not found",
              },
            ],
          } satisfies IError,
          { status: 404 },
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
