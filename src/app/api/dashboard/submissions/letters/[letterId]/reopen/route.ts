import { NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  getSubmissionLetterStatus,
  reopenSubmissionLetter,
} from "@/server/dashboard/letter-service";

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

    const { letterId } = await params;
    const letter = await getSubmissionLetterStatus({ letterId });

    if (!letter || letter.deletedAt) {
      return jsonError(
        [{ code: "not-found", message: "Letter not found" }],
        404,
      );
    }

    if (letter.status !== "REJECTED") {
      return jsonError(
        [
          {
            code: "validation/invalid-request",
            message: "Only rejected letters can be reopened",
          },
        ],
        400,
      );
    }

    await reopenSubmissionLetter({ letterId });

    return NextResponse.json(
      { message: "Letter reopened successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
