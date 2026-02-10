import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type IError from "@/types/error";

export function jsonError(
  issues: IError["issues"],
  status: number,
  init: Omit<ResponseInit, "status"> = {},
): NextResponse<IError> {
  return NextResponse.json({ issues } satisfies IError, { status, ...init });
}

export function zodInvalidInput(error: ZodError): NextResponse<IError> {
  return jsonError(
    error.issues.map((issue) => ({
      code: "validation/invalid-input",
      message: issue.message,
    })),
    400,
  );
}

export function unknownErrorResponse(
  message = "Something went wrong",
): NextResponse<IError> {
  return jsonError([{ code: "unknown-error", message }], 500);
}
