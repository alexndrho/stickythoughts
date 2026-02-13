import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { formatLetters } from "@/utils/letter";
import type { LetterType } from "@/types/letter";
import { unknownErrorResponse } from "@/lib/http";
import { listUserLetters } from "@/server/user";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) => {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { username } = await params;

    const letters = await listUserLetters({
      username,
      lastId,
      viewerUsername: session?.user?.username ?? null,
      viewerUserId: session?.user?.id,
    });

    const formattedLetters = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    }) satisfies LetterType[];

    return NextResponse.json(formattedLetters);
  } catch (error) {
    console.error("Error fetching user letters:", error);
    return unknownErrorResponse("Unknown error");
  }
};
