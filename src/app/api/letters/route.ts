import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { guardSession } from "@/lib/session-guard";
import { createLetterServerInput } from "@/lib/validations/letter";
import { formatLetters } from "@/utils/letter";
import {
  jsonError,
  unknownErrorResponse,
  zodInvalidInput,
} from "@/lib/http";
import { isUniqueConstraintError } from "@/server/db";
import { createLetter, listLetters } from "@/server/letter";

export async function POST(req: Request) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { title, body, isAnonymous } = createLetterServerInput.parse(
      await req.json(),
    );

    const post = await createLetter({
      authorId: session.user.id,
      title,
      body,
      isAnonymous,
    });

    return NextResponse.json({
      id: post.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError(
        [
          {
            code: "letter/title-already-exists",
            message: "Post name must be unique",
          },
        ],
        400,
      );
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const letters = await listLetters({
      lastId,
      viewerUserId: session?.user.id,
    });

    const formattedPosts = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    });

    return NextResponse.json(formattedPosts, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
