import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatLetters } from "@/utils/letter";
import type { LetterType } from "@/types/letter";
import { LETTERS_PER_PAGE } from "@/config/letter";
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

    const letters = await prisma.letter.findMany({
      take: LETTERS_PER_PAGE,
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
            replies: {
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

    const formattedLetters = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    }) satisfies LetterType[];

    return NextResponse.json(formattedLetters);
  } catch (error) {
    console.error("Error fetching user letters:", error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
};
