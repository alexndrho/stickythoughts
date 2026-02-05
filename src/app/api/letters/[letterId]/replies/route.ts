import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificationType } from "@/generated/prisma/enums";
import { createLetterReplyServerInput } from "@/lib/validations/letter";
import { LETTER_REPLIES_PER_PAGE } from "@/config/letter";
import { formatLetterReplies } from "@/utils/letter";
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

    const { body, isAnonymous } = createLetterReplyServerInput.parse(
      await request.json(),
    );

    const reply = await prisma.letterReply.create({
      data: {
        letter: {
          connect: {
            id: letterId,
          },
        },
        author: {
          connect: {
            id: session.user.id,
          },
        },
        body,
        isAnonymous: isAnonymous,
      },
      include: {
        letter: {
          select: {
            authorId: true,
            isAnonymous: true,
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

    const formattedPost = formatLetterReplies(reply, session.user.id);

    if (reply.letter.authorId !== reply.authorId) {
      await prisma.notification.create({
        data: {
          user: { connect: { id: reply.letter.authorId } },
          type: NotificationType.LETTER_REPLY,
          actors: {
            create: {
              userId: reply.authorId,
            },
          },
          reply: { connect: { id: reply.id } },
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
  { params }: { params: Promise<{ letterId: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { letterId } = await params;

    const replies = await prisma.letterReply.findMany({
      take: LETTER_REPLIES_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: {
        letterId,
        deletedAt: null,
        letter: {
          deletedAt: null,
        },
      },
      include: {
        letter: {
          select: {
            authorId: true,
            isAnonymous: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPosts = formatLetterReplies(replies, session?.user.id);

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
