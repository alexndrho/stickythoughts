import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { guardSession } from "@/lib/session-guard";
import { updateLetterServerInput } from "@/lib/validations/letter";
import { getLetterPublic, LetterNotFoundError } from "@/lib/queries/letter";
import { formatLetters } from "@/utils/letter";
import {
  jsonError,
  unknownErrorResponse,
  zodInvalidInput,
} from "@/lib/http";
import { isRecordNotFoundError } from "@/server/db";
import { softDeleteLetter, updateLetter } from "@/server/letter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { letterId } = await params;
    const letter = await getLetterPublic({
      letterId,
      sessionUserId: session?.user?.id ?? null,
    });

    return NextResponse.json(letter);
  } catch (error) {
    if (error instanceof LetterNotFoundError) {
      return jsonError(
        [{ code: "not-found", message: "Letter post not found" }],
        404,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const { letterId } = await params;
    const { body } = updateLetterServerInput.parse(await request.json());

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const updatedLetter = await updateLetter({
      letterId,
      authorId: session.user.id,
      body,
    });

    const formattedLetter = formatLetters({
      sessionUserId: session.user.id,
      letters: updatedLetter,
    });

    return NextResponse.json(formattedLetter);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    } else if (isRecordNotFoundError(error)) {
      return jsonError(
        [{ code: "not-found", message: "Letter post not found" }],
        404,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const { letterId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          letter: ["delete"],
        },
      },
    });

    await softDeleteLetter({
      letterId,
      deletedById: session.user.id,
      ...(hasPermission.success ? {} : { authorId: session.user.id }),
    });

    return NextResponse.json(
      {
        message: "Letter post deleted",
      },
      { status: 200 },
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return jsonError(
        [{ code: "not-found", message: "Letter post not found" }],
        404,
      );
    }

    console.error(error);
    return unknownErrorResponse("Unknown error");
  }
}
