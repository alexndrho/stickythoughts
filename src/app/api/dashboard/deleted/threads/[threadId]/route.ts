import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
        } satisfies IError,
        { status: 401 },
      );
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          thread: ["restore"],
        },
      },
    });

    if (!hasPermission.success) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/forbidden", message: "Forbidden" }],
        } satisfies IError,
        { status: 403 },
      );
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
        } satisfies IError,
        { status: 401 },
      );
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          thread: ["purge"],
        },
      },
    });

    if (!hasPermission.success) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/forbidden", message: "Forbidden" }],
        } satisfies IError,
        { status: 403 },
      );
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
