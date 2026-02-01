import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import type IError from "@/types/error";
import type { DeletedThreadFromServer } from "@/types/deleted";

export async function GET(req: NextRequest) {
  try {
    const session = await guardSession({
      permission: {
        thread: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

    const items = await prisma.thread.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
      take: ADMIN_DELETED_PER_PAGE,
      skip,
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        deletedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(items satisfies DeletedThreadFromServer[], {
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
