import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { guardSession } from "@/lib/session-guard";
import { unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import type { SubmissionLetterFromServer } from "@/types/submission";
import { listSubmissionLetters } from "@/server/dashboard";
import { letterSubmissionsStatusQueryInput } from "@/lib/validations/letter";

export async function GET(request: NextRequest) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letter: ["list-submissions"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = letterSubmissionsStatusQueryInput.parse(
      searchParams.get("status"),
    );
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);

    const items = await listSubmissionLetters({
      page,
      status,
    });

    return NextResponse.json(items satisfies SubmissionLetterFromServer[], {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
