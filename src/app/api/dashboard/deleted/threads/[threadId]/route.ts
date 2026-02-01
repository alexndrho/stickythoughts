import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thread: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { threadId } = await params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { deletedAt: true },
    });

    if (!thread || !thread.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Thread not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.thread.update({
      where: { id: threadId },
      data: { deletedAt: null, deletedById: null },
    });

    return NextResponse.json(
      { message: "Thread restored successfully" },
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
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thread: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { threadId } = await params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { deletedAt: true },
    });

    if (!thread || !thread.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Thread not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.thread.delete({
      where: { id: threadId },
    });

    return NextResponse.json(
      { message: "Thread deleted permanently" },
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
