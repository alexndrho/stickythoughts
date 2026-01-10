import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatUserThreadComments } from "@/utils/thread";
import { THREADS_PER_PAGE } from "@/config/thread";
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

    const comments = await prisma.threadComment.findMany({
      take: THREADS_PER_PAGE,
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
        ...(session?.user?.username !== username && {
          isAnonymous: false,
        }),
      },
      include: {
        thread: {
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

    const formattedComments = formatUserThreadComments(comments);

    return NextResponse.json(formattedComments);
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
