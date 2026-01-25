import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateThreadCommentServerInput } from "@/lib/validations/thread";
import type IError from "@/types/error";

export async function PUT(
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
    const { body } = updateThreadCommentServerInput.parse(await request.json());

    const updatedComment = await prisma.threadComment.update({
      where: {
        id: commentId,
        threadId,
        authorId: session.user.id,
      },
      data: {
        body,
      },
    });

    return NextResponse.json(updatedComment, { status: 200 });
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
                message: "Comment not found",
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
  { params }: { params: Promise<{ threadId: string; commentId: string }> },
) {
  try {
    const { threadId, commentId } = await params;

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

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          threadComment: ["delete"],
        },
      },
    });

    const deletedComment = await prisma.threadComment.delete({
      where: {
        id: commentId,
        threadId,
        ...(hasPermission.success ? {} : { authorId: session.user.id }),
      },
      select: {
        authorId: true,
        thread: {
          select: {
            authorId: true,
          },
        },
      },
    });

    // Delete notifications for both the comment author and the thread author
    await prisma.notification.deleteMany({
      where: {
        userId: {
          in: [deletedComment.authorId, deletedComment.thread.authorId],
        },
        commentId,
      },
    });

    return NextResponse.json(
      {
        message: "Comment deleted successfully",
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
                message: "Comment not found",
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
