import { NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  getDeletedThoughtStatus,
  purgeThought,
  restoreThought,
} from "@/server/thought";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["restore"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;

    const thought = await getDeletedThoughtStatus({ thoughtId });

    if (!thought || !thought.deletedAt) {
      return jsonError([{ code: "not-found", message: "Thought not found" }], 404);
    }

    await restoreThought({ thoughtId });

    return NextResponse.json(
      { message: "Thought restored successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["purge"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;

    const thought = await getDeletedThoughtStatus({ thoughtId });

    if (!thought || !thought.deletedAt) {
      return jsonError([{ code: "not-found", message: "Thought not found" }], 404);
    }

    await purgeThought({ thoughtId });

    return NextResponse.json(
      { message: "Thought deleted permanently" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
