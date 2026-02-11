import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { thoughtCacheTags } from "@/lib/cache-tags";
import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import { isRecordNotFoundError } from "@/server/db";
import { softDeleteThought } from "@/server/thought";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const { thoughtId } = await params;

    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permission: {
          thought: ["delete"],
        },
      },
    });

    if (!hasPermission.success) {
      return jsonError([{ code: "auth/forbidden", message: "Forbidden" }], 403);
    }

    await softDeleteThought({ thoughtId, deletedById: session.user.id });
    revalidateTag(thoughtCacheTags.publicList, "max");
    revalidateTag(thoughtCacheTags.publicCount, "max");
    revalidateTag(thoughtCacheTags.publicHighlight, "max");

    return NextResponse.json(
      { message: "Thought deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return jsonError(
        [{ code: "not-found", message: "Thought not found" }],
        404,
      );
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
