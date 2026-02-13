import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { updateLetterReplyServerInput } from "@/lib/validations/letter";
import { formatLetterReplies } from "@/utils/letter";
import { guardSession } from "@/lib/session-guard";
import {
  jsonError,
  unknownErrorResponse,
  zodInvalidInput,
} from "@/lib/http";
import { isRecordNotFoundError } from "@/server/db";
import {
  softDeleteLetterReply,
  updateLetterReply,
} from "@/server/letter";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ letterId: string; replyId: string }> },
) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId, replyId } = await params;
    const { body } = updateLetterReplyServerInput.parse(await request.json());

    const updatedReply = await updateLetterReply({
      letterId,
      replyId,
      authorId: session.user.id,
      body,
    });

    const formattedReply = formatLetterReplies(updatedReply, session.user.id);

    return NextResponse.json(formattedReply, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    } else if (isRecordNotFoundError(error)) {
      return jsonError(
        [{ code: "not-found", message: "Reply not found" }],
        404,
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
    const { letterId, replyId } = await params;

    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          letterReply: ["delete"],
        },
      },
    });

    await softDeleteLetterReply({
      letterId,
      replyId,
      deletedById: session.user.id,
      ...(hasPermission.success ? {} : { authorId: session.user.id }),
    });

    return NextResponse.json(
      {
        message: "Reply deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return jsonError(
        [{ code: "not-found", message: "Reply not found" }],
        404,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}
