import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { guardSession } from "@/lib/session-guard";
import { LETTERS_PER_PAGE } from "@/config/letter";
import { createLetterServerInput } from "@/lib/validations/letter";
import { formatLetters } from "@/utils/letter";
import type IError from "@/types/error";

export async function POST(req: Request) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { title, body, isAnonymous } = createLetterServerInput.parse(
      await req.json(),
    );

    const post = await prisma.letter.create({
      data: {
        title,
        body,
        isAnonymous: isAnonymous,
        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
    });
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
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            issues: [
              {
                code: "letter/title-already-exists",
                message: "Post name must be unique",
              },
            ],
          } satisfies IError,
          { status: 400 },
        );
      }
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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const letters = await prisma.letter.findMany({
      take: LETTERS_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: { deletedAt: null },
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

    const formattedPosts = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    });

    return NextResponse.json(formattedPosts, { status: 200 });
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
