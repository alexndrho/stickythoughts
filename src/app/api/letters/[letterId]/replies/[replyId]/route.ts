import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateLetterReplyServerInput } from "@/lib/validations/letter";
import type IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    const { body } = updateLetterReplyServerInput.parse(await request.json());

    const updateResult = await prisma.letterReply.updateMany({
      where: {
        id: replyId,
        letterId,
        deletedAt: null,
        authorId: session.user.id,
        letter: {
          deletedAt: null,
        },
      },
      data: {
        body,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Reply not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    const updatedReply = await prisma.letterReply.findUnique({
      where: {
        id: replyId,
      },
      select: {
        id: true,
        body: true,
        authorId: true,
        isAnonymous: true,
        letterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!updatedReply) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "not-found",
              message: "Reply not found",
            },
          ],
        } satisfies IError,
        { status: 404 },
      );
    }

    return NextResponse.json(updatedReply, { status: 200 });
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
                message: "Reply not found",
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
  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const { letterId, replyId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          letterReply: ["delete"],
        },
      },
    });

    const deletedReply = await prisma.letterReply.update({
      where: {
        id: replyId,
        letterId,
        deletedAt: null,
        ...(hasPermission.success ? {} : { authorId: session.user.id }),
      },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      select: {
        authorId: true,
        letter: {
          select: {
            authorId: true,
          },
        },
      },
    });

    // Delete notifications for both the reply author and the letter author
    await prisma.notification.deleteMany({
      where: {
        userId: {
          in: [deletedReply.authorId, deletedReply.letter.authorId],
        },
        replyId,
      },
    });

    return NextResponse.json(
      {
        message: "Reply deleted successfully",
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
                message: "Reply not found",
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
