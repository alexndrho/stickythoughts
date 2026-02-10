import "client-only";

import type IError from "@/types/error";
import { toServerError } from "@/utils/error/ServerError";

function coerceIssues(data: unknown): IError["issues"] {
  if (
    typeof data === "object" &&
    data !== null &&
    "issues" in data &&
    Array.isArray((data as { issues?: unknown }).issues)
  ) {
    return (data as { issues: IError["issues"] }).issues;
  }

  return [{ code: "unknown-error", message: "Something went wrong" }];
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  opts: { errorMessage: string },
): Promise<T> {
  const res = await fetch(input, init);

  // Most of our API routes return `{ issues }` on error and JSON on success.
  // If a route ever returns non-JSON, we still want a coherent error.
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw toServerError(opts.errorMessage, coerceIssues(data));
  }

  return data as T;
}
