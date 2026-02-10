import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { formatLetters } from "@/utils/letter";
import type { LetterType } from "@/types/letter";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  getUserLikesVisibility,
  listUserLikedLetters,
} from "@/server/user";
import { UserNotFoundError } from "@/server/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const { username } = await params;

    const user = await getUserLikesVisibility({ username });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      username !== session?.user?.username &&
      user.likesVisibility === "PRIVATE"
    ) {
      return jsonError(
        [{ code: "auth/forbidden", message: "This user's likes are private" }],
        403,
      );
    }

    const letters = await listUserLikedLetters({
      username,
      lastId,
      viewerUserId: session?.user?.id,
    });

    const formattedLetters = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    }) satisfies LetterType[];

    return NextResponse.json(formattedLetters);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: "not-found", message: "User not found" }], 404);
    }

    console.error("Error fetching user likes:", error);
    return unknownErrorResponse("Unknown error");
  }
}
