import { NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse } from "@/lib/http";
import { countDeletedReplies } from "@/server/admin";

export async function GET() {
  try {
    const session = await guardSession({
      permission: {
        letterReply: ["list-deleted"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const total = await countDeletedReplies();

    return NextResponse.json({ total }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
