import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { createLetterReplyServerInput } from "@/lib/validations/letter";
import { formatLetterReplies } from "@/utils/letter";
import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import { createLetterReply, listLetterReplies } from "@/server/letter";
import { LetterNotFoundError } from "@/server/letter";
import { toDTO } from "@/lib/http/to-dto";
import type { LetterReplyDTO } from "@/types/letter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: request.headers });

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

    return NextResponse.json(toDTO(formattedPost) satisfies LetterReplyDTO, {
      status: 201,
    });
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
  request: NextRequest,
  { params }: { params: Promise<{ letterId: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get("lastId");

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { letterId } = await params;

    const replies = await listLetterReplies({
      letterId,
      lastId,
      viewerUserId: session?.user.id,
    });

    const formattedPosts = formatLetterReplies(replies, session?.user.id);

    return NextResponse.json(toDTO(formattedPosts) satisfies LetterReplyDTO[]);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
