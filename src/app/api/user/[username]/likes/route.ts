import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { formatLetters } from "@/utils/letter";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import { getUserLikesVisibility, listUserLikedLetters } from "@/server/user";
import { UserNotFoundError } from "@/server/user";
import { toDTO } from "@/lib/http/to-dto";
import type { LetterDTO } from "@/types/letter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const { username } = await params;

    const user = await getUserLikesVisibility({ username });

    const session = await auth.api.getSession({
      headers: request.headers,
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
    });

    return NextResponse.json(toDTO(formattedLetters) satisfies LetterDTO[]);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: "not-found", message: "User not found" }], 404);
    }

    console.error("Error fetching user likes:", error);
    return unknownErrorResponse("Unknown error");
  }
}
