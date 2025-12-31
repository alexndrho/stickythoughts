import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificationType } from "@/generated/prisma/enums";
import { createThreadCommentServerInput } from "@/lib/validations/form";
import { THREAD_COMMENTS_PER_PAGE } from "@/config/thread";
import { formatThreadComments } from "@/utils/thread";
import type { ThreadCommentType } from "@/types/thread";
import type IError from "@/types/error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
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

    const { threadId } = await params;
    const { body } = createThreadCommentServerInput.parse(await request.json());

    const comment = await prisma.threadComment.create({
      data: {
        thread: {
          connect: {
            id: threadId,
          },
        },
        author: {
          connect: {
            id: session.user.id,
          },
        },
        body,
      },
      include: {
        thread: {
          select: {
            authorId: true,
          },
        },
        author: {
          select: {
            id: true,
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
          },
        },
      },
    });

    const { likes, _count, ...restComment } = comment;

    const formattedPost = {
      ...restComment,
      likes: {
        liked: !!likes?.length,
        count: _count.likes,
      },
    } satisfies ThreadCommentType;

    if (comment.thread.authorId !== comment.authorId) {
      await prisma.notification.create({
        data: {
          user: { connect: { id: comment.thread.authorId } },
          type: NotificationType.THREAD_COMMENT,
          actors: {
            create: {
              userId: comment.authorId,
            },
          },
          comment: { connect: { id: comment.id } },
        },
      });
    }

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        issues: error.issues.map((issue) => ({
          code: "validation/invalid-input",
          message: issue.message,
        })),
      };

      return NextResponse.json(zodError, { status: 400 });
    }

    console.error(error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { threadId } = await params;

    const comments = await prisma.threadComment.findMany({
      take: THREAD_COMMENTS_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: {
        threadId,
      },
      include: {
        author: {
          select: {
            id: true,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPosts = formatThreadComments(comments);

    return NextResponse.json(formattedPosts);
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
