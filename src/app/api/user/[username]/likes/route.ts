import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatThreads } from "@/utils/thread";
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

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        settings: {
          select: {
            privacySettings: {
              select: {
                likesVisibility: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "User not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      username !== session?.user?.username &&
      user.settings?.privacySettings?.likesVisibility === "PRIVATE"
    ) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "auth/forbidden",
              message: "This user's likes are private",
            },
          ],
        } satisfies IError,
        { status: 403 },
      );
    }

    const threads = await prisma.thread.findMany({
      take: THREADS_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: {
        likes: {
          some: {
            user: {
              username,
            },
          },
        },
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
            comments: true,
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
    });

    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error("Error fetching user likes:", error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}
