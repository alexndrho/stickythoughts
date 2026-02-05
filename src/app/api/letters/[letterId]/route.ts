import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { guardSession } from "@/lib/session-guard";
import IError from "@/types/error";
import { updateLetterServerInput } from "@/lib/validations/letter";
import type { LetterType } from "@/types/letter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { letterId } = await params;

    const letter = await prisma.letter.findUnique({
      where: {
        id: letterId,
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
    });

    if (!letter || letter.deletedAt) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Letter post not found",
            },
          ],
        } satisfies IError,
        {
          status: 404,
        },
      );
    }

    const { likes, _count, authorId, ...restLetter } = letter;

    const formattedPost: LetterType = {
      ...restLetter,
      author: restLetter.isAnonymous ? undefined : restLetter.author,
      isOwner: session?.user?.id === authorId,
      likes: {
        liked: !!likes?.length,
        count: _count.likes,
      },
      replies: {
        count: _count.replies,
      },
    } satisfies LetterType;

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
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const { letterId } = await params;
    const { body } = updateLetterServerInput.parse(await request.json());

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const updateResult = await prisma.letter.update({
      where: {
        id: letterId,
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

    const { authorId, ...restLetter } = updateResult;

    const formattedLetter: LetterType = {
      ...restLetter,
      author: restLetter.isAnonymous ? undefined : restLetter.author,
      isOwner: session.user.id === authorId,
      likes: {
        liked: false,
        count: 0,
      },
      replies: {
        count: 0,
      },
    } satisfies LetterType;

    return NextResponse.json(formattedLetter);
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
                message: "Letter post not found",
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
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const { letterId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          letter: ["delete"],
        },
      },
    });

    await prisma.letter.update({
      where: {
        id: letterId,
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
        message: "Letter post deleted",
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
                message: "Letter post not found",
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
