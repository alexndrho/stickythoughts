import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        letter: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;

    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      select: { deletedAt: true },
    });

    if (!letter || !letter.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Letter not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.letter.update({
      where: { id: letterId },
      data: { deletedAt: null, deletedById: null },
    });

    return NextResponse.json(
      { message: "Letter restored successfully" },
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
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        letter: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;

    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      select: { deletedAt: true },
    });

    if (!letter || !letter.deletedAt) {
      return NextResponse.json(
        {
          issues: [{ code: "not-found", message: "Letter not found" }],
        } satisfies IError,
        { status: 404 },
      );
    }

    await prisma.letter.delete({
      where: { id: letterId },
    });

    return NextResponse.json(
      { message: "Letter deleted permanently" },
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
