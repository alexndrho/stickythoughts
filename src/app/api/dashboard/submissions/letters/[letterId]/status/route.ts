import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import { reviewLetterServerInput } from "@/lib/validations/letter";
import {
  getSubmissionLetterStatus,
  setSubmissionLetterStatus,
} from "@/server/dashboard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letter: ["review"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { status } = reviewLetterServerInput.parse(await request.json());

    const { letterId } = await params;
    const letter = await getSubmissionLetterStatus({ letterId });

    if (!letter || letter.deletedAt) {
      return jsonError(
        [{ code: "not-found", message: "Letter not found" }],
        404,
      );
    }

    if (letter.status === status) {
      return NextResponse.json(
        { message: `Letter is already ${status.toLowerCase()}` },
        { status: 200 },
      );
    }

    await setSubmissionLetterStatus({
      letterId,
      status,
      statusSetById: session.user.id,
    });

    return NextResponse.json(
      { message: `Letter ${status.toLowerCase()} successfully` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
