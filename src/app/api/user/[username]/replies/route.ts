import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { formatUserLetterReplies } from "@/utils/letter";
import type { UserLetterReplyType } from "@/types/letter";
import { unknownErrorResponse } from "@/lib/http";
import { listUserReplies } from "@/server/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const { username } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const replies = await listUserReplies({
      username,
      lastId,
      viewerUsername: session?.user?.username ?? null,
      viewerUserId: session?.user?.id,
    });

    const formattedReplies =
      formatUserLetterReplies(replies) satisfies UserLetterReplyType[];

    return NextResponse.json(formattedReplies);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
