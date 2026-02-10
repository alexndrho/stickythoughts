import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { createLetterReplyServerInput } from "@/lib/validations/letter";
import { formatLetterReplies } from "@/utils/letter";
import { guardSession } from "@/lib/session-guard";
import {
  jsonError,
  unknownErrorResponse,
  zodInvalidInput,
} from "@/lib/http";
import {
  createLetterReply,
  listLetterReplies,
} from "@/server/letter";
import { LetterNotFoundError } from "@/server/letter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;
    const { body, isAnonymous } = createLetterReplyServerInput.parse(
      await request.json(),
    );

    const reply = await createLetterReply({
      letterId,
      authorId: session.user.id,
      body,
      isAnonymous,
    });

    const formattedPost = formatLetterReplies(reply, session.user.id);

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    if (error instanceof LetterNotFoundError) {
      return jsonError(
        [{ code: "not-found", message: "Letter post not found" }],
        404,
      );
    }

    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ letterId: string }> },
) {
  const searchParams = req.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { letterId } = await params;

    const replies = await listLetterReplies({
      letterId,
      lastId,
      viewerUserId: session?.user.id,
    });

    const formattedPosts = formatLetterReplies(replies, session?.user.id);

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
