import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;

    const thought = await prisma.thought.findUnique({
      where: { id: thoughtId },
      select: { deletedAt: true },
    });

    if (!thought || !thought.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Thought not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.thought.update({
      where: { id: thoughtId },
      data: { deletedAt: null, deletedById: null },
    });

    return NextResponse.json(
      { message: "Thought restored successfully" },
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
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;

    const thought = await prisma.thought.findUnique({
      where: { id: thoughtId },
      select: { deletedAt: true },
    });

    if (!thought || !thought.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Thought not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.thought.delete({
      where: { id: thoughtId },
    });

    return NextResponse.json(
      { message: "Thought deleted permanently" },
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
