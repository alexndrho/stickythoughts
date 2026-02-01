import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        threadComment: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { commentId } = await params;

    const comment = await prisma.threadComment.findUnique({
      where: { id: commentId },
      select: { deletedAt: true },
    });

    if (!comment || !comment.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Comment not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.threadComment.update({
      where: { id: commentId },
      data: { deletedAt: null, deletedById: null },
    });

    return NextResponse.json(
      { message: "Comment restored successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        threadComment: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { commentId } = await params;

    const comment = await prisma.threadComment.findUnique({
      where: { id: commentId },
      select: { deletedAt: true },
    });

    if (!comment || !comment.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Comment not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.threadComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Comment deleted permanently" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
  }
}
