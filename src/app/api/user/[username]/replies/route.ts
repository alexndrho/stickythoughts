import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatUserLetterReplies } from "@/utils/letter";
import type { UserLetterReplyType } from "@/types/letter";
import { LETTER_REPLIES_PER_PAGE } from "@/config/letter";
import type IError from "@/types/error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const { username } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const replies = await prisma.letterReply.findMany({
      take: LETTER_REPLIES_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: {
        author: {
          username,
        },
        deletedAt: null,
        letter: {
          deletedAt: null,
        },
        ...(session?.user?.username !== username && {
          isAnonymous: false,
        }),
      },
      include: {
        letter: {
          select: {
            title: true,
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

    const formattedReplies =
      formatUserLetterReplies(replies) satisfies UserLetterReplyType[];

    return NextResponse.json(formattedReplies);
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
