import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  likeReply,
  ReplyNotFoundError,
  unlikeReply,
} from "@/server/letter";
import {
  isRecordNotFoundError,
  isUniqueConstraintError,
} from "@/server/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    await likeReply({ letterId, replyId, userId: session.user.id });

    return NextResponse.json(
      {
        message: "Reply liked successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ReplyNotFoundError) {
      return jsonError([{ code: "not-found", message: "Reply not found" }], 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError(
        [
          {
            code: "validation/unique-constraint",
            message: "You have already liked this reply",
          },
        ],
        400,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}

export async function DELETE(
  request: Request,

  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    await unlikeReply({ letterId, replyId, userId: session.user.id });

    return NextResponse.json(
      {
        message: "Reply unliked successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ReplyNotFoundError) {
      return jsonError([{ code: "not-found", message: "Reply not found" }], 404);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError(
        [
          {
            code: "validation/unique-constraint",
            message: "You have not liked this reply",
          },
        ],
        400,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}
