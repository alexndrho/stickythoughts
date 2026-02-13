import { NextResponse } from "next/server";

import { THOUGHT_HIGHLIGHT_LOCK_HOURS } from "@/config/thought";
import { revalidateThoughtHighlight } from "@/lib/cache/thought-revalidation";
import { guardSession } from "@/lib/session-guard";
import {
  formatHighlightedThoughtLockRemaining,
  isHighlightedThoughtLocked,
} from "@/utils/thought";
import type {
  PrivateHighlightedThoughtPayload,
} from "@/types/thought";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  findCurrentHighlight,
  getThoughtHighlightStatus,
  updateHighlight,
} from "@/server/dashboard";

const highlightLockedResponse = (highlightedAt: Date) =>
  jsonError(
    [
      {
        code: "thought/highlight-locked",
        message: `Highlighted thoughts can only be changed after ${THOUGHT_HIGHLIGHT_LOCK_HOURS} hours. Try again in ${formatHighlightedThoughtLockRemaining(highlightedAt)}.`,
      },
    ],
    403,
  );

export async function POST(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ["highlight"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;
    const isAdmin = session.user.role === "admin";

    if (!isAdmin) {
      const currentHighlight = await findCurrentHighlight();

      if (
        currentHighlight?.highlightedAt &&
        isHighlightedThoughtLocked(currentHighlight.highlightedAt)
      ) {
        return highlightLockedResponse(currentHighlight.highlightedAt);
      }
    }

    const updated = await updateHighlight({
      highlighted: true,
      thoughtId,
      userId: session.user.id,
    });
    revalidateThoughtHighlight();

    if (!updated.highlightedAt || !updated.highlightedBy) {
      return unknownErrorResponse("Failed to highlight thought");
    }

    const highlightedThought = {
      ...updated,
      highlightedAt: updated.highlightedAt,
      highlightedBy: updated.highlightedBy,
    } satisfies PrivateHighlightedThoughtPayload;

    return NextResponse.json(highlightedThought);
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
      headers: request.headers,
      permission: {
        thought: ["highlight"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;
    const isAdmin = session.user.role === "admin";

    if (!isAdmin) {
      const thought = await getThoughtHighlightStatus({ thoughtId });

      if (
        thought?.highlightedAt &&
        isHighlightedThoughtLocked(thought.highlightedAt)
      ) {
        return highlightLockedResponse(thought.highlightedAt);
      }
    }

    await updateHighlight({
      highlighted: false,
      thoughtId,
      userId: session.user.id,
    });
    revalidateThoughtHighlight();

    return NextResponse.json({
      message: "Thought highlight removed successfully",
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
