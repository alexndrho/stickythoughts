import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import { ADMIN_THOUGHTS_PER_PAGE } from "@/config/admin";
import type { PublicThoughtPayload } from "@/utils/thought";
import type IError from "@/types/error";

export async function GET(req: NextRequest) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["list"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * ADMIN_THOUGHTS_PER_PAGE;

    const thoughts = await prisma.thought.findMany({
      take: ADMIN_THOUGHTS_PER_PAGE,
      skip,
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        author: true,
        message: true,
        color: true,
        createdAt: true,
      },
    });

    return NextResponse.json(thoughts satisfies PublicThoughtPayload[], {
      status: 200,
    });
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
