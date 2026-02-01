import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import type IError from "@/types/error";

export async function GET() {
  try {
    const session = await guardSession({
      permission: {
        thread: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const total = await prisma.thread.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });

    return NextResponse.json({ total }, { status: 200 });
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
