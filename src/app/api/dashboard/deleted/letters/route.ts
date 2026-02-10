import { type NextRequest, NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import type { DeletedLetterFromServer } from "@/types/deleted";
import { unknownErrorResponse } from "@/lib/http";
import { listDeletedLetters } from "@/server/admin";

export async function GET(req: NextRequest) {
  try {
    const session = await guardSession({
      permission: {
        letter: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const items = await listDeletedLetters({ page });

    return NextResponse.json(items satisfies DeletedLetterFromServer[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
