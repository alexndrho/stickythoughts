import { type NextRequest, NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse } from "@/lib/http";
import { listDeletedReplies } from "@/server/dashboard";
import { toDTO } from "@/lib/http/to-dto";
import type { DeletedLetterReplyDTO } from "@/types/deleted";

export async function GET(request: NextRequest) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letterReply: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const items = await listDeletedReplies({ page });

    return NextResponse.json(toDTO(items) satisfies DeletedLetterReplyDTO[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
