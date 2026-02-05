import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        letterReply: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { replyId } = await params;

    const reply = await prisma.letterReply.findUnique({
      where: { id: replyId },
      select: { deletedAt: true },
    });

    if (!reply || !reply.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Reply not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.letterReply.update({
      where: { id: replyId },
      data: { deletedAt: null, deletedById: null },
    });

    return NextResponse.json(
      { message: "Reply restored successfully" },
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
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        letterReply: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { replyId } = await params;

    const reply = await prisma.letterReply.findUnique({
      where: { id: replyId },
      select: { deletedAt: true },
    });

    if (!reply || !reply.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Reply not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.letterReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json(
      { message: "Reply deleted permanently" },
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
