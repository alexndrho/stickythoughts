import "server-only";

import { headers as nextHeaders } from "next/headers";
import type { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import type IError from "@/types/error";

type UserHasPermissionArgs = NonNullable<
  Parameters<typeof auth.api.userHasPermission>[0]
>;

type Permission = UserHasPermissionArgs extends { body?: infer Body }
  ? Body extends { permission: infer Perm }
    ? Perm
    : never
  : never;

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export const unauthorizedResponse = () =>
  jsonError([{ code: "auth/unauthorized", message: "Unauthorized" }], 401);

export const forbiddenResponse = () =>
  jsonError([{ code: "auth/forbidden", message: "Forbidden" }], 403);

export const notFoundResponse = () =>
  jsonError([{ code: "not-found", message: "Not found" }], 404);

export async function guardSession(
  options: {
    headers?: Headers;
    permission?: Permission;
    onUnauthenticated?: "unauthorized" | "not-found";
    onForbidden?: "forbidden" | "not-found";
  } = {},
): Promise<NonNullable<Session> | NextResponse<IError>> {
  const session = await auth.api.getSession({
    headers: options.headers ?? (await nextHeaders()),
  });

  if (!session?.user?.id) {
    return options.onUnauthenticated === "not-found"
      ? notFoundResponse()
      : unauthorizedResponse();
  }

  if (options.permission) {
    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: options.permission,
      },
    });

    if (!hasPermission.success) {
      return options.onForbidden === "not-found"
        ? notFoundResponse()
        : forbiddenResponse();
    }
  }

  return session;
}
