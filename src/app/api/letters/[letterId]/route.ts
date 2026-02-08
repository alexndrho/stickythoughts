import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { guardSession } from "@/lib/session-guard";
import IError from "@/types/error";
import { updateLetterServerInput } from "@/lib/validations/letter";
import { getLetterPublic, LetterNotFoundError } from "@/lib/queries/letter";
import { formatLetters } from "@/utils/letter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { letterId } = await params;
    const letter = await getLetterPublic({
      letterId,
      sessionUserId: session?.user?.id ?? null,
    });

    return NextResponse.json(letter);
  } catch (error) {
    if (error instanceof LetterNotFoundError) {
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

    const updatedLetter = await prisma.letter.update({
      where: {
        id: letterId,
        authorId: session.user.id,
        deletedAt: null,
      },
      data: {
        body,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          select: {
            userId: true,
          },
        },
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

    const formattedLetter = formatLetters({
      sessionUserId: session.user.id,
      letters: updatedLetter,
    });

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
