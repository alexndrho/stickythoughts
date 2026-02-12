import { type NextRequest, NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import type { DeletedLetterReplyFromServer } from "@/types/deleted";
import { unknownErrorResponse } from "@/lib/http";
import { listDeletedReplies } from "@/server/dashboard";

export async function GET(req: NextRequest) {
  try {
    const session = await guardSession({
      permission: {
        letterReply: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const items = await listDeletedReplies({ page });

    return NextResponse.json(items satisfies DeletedLetterReplyFromServer[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
