import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatThreads } from "@/utils/thread";
import type { ThreadType } from "@/types/thread";
import { THREADS_PER_PAGE } from "@/config/thread";
import type IError from "@/types/error";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) => {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { username } = await params;

    const threads = await prisma.thread.findMany({
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
        deletedAt: null,
        ...(session?.user?.username !== username && {
          isAnonymous: false,
        }),
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedThreads = formatThreads({
      sessionUserId: session?.user?.id,
      threads,
    }) satisfies ThreadType[];

    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error("Error fetching user threads:", error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
};
