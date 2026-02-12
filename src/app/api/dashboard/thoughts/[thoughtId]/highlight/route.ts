import { NextResponse } from "next/server";

import {
  THOUGHT_HIGHLIGHT_LOCK_DURATION_MS,
  THOUGHT_HIGHLIGHT_LOCK_HOURS,
} from "@/config/thought";
import { revalidateThoughtHighlight } from "@/lib/cache/thought-revalidation";
import { guardSession } from "@/lib/session-guard";
import { isHighlightLocked } from "@/utils/thought";
import { formatDuration, intervalToDuration } from "date-fns";
import type { PrivateThoughtPayload } from "@/types/thought";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import {
  findCurrentHighlight,
  getThoughtHighlightStatus,
  updateHighlight,
} from "@/server/dashboard";

const formatRemaining = (remainingMs: number) => {
  const safeMs = Math.max(60_000, remainingMs);
  const duration = intervalToDuration({ start: 0, end: safeMs });
  return formatDuration(
    {
      hours: duration.hours ?? 0,
      minutes: duration.minutes ?? 0,
    },
    {
      format: ["hours", "minutes"],
      zero: false,
      delimiter: " ",
    },
  );
};

const highlightLockedResponse = (remainingMs: number) =>
  jsonError(
    [
      {
        code: "thought/highlight-locked",
        message: `Highlighted thoughts can only be changed after ${THOUGHT_HIGHLIGHT_LOCK_HOURS} hours. Try again in ${formatRemaining(
          remainingMs,
        )}.`,
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
        isHighlightLocked(currentHighlight.highlightedAt)
      ) {
        const remainingMs =
          THOUGHT_HIGHLIGHT_LOCK_DURATION_MS -
          (Date.now() - currentHighlight.highlightedAt.getTime());
        return highlightLockedResponse(remainingMs);
      }
    }

    const updated = await updateHighlight({
      highlighted: true,
      thoughtId,
      userId: session.user.id,
    });
    revalidateThoughtHighlight();

    return NextResponse.json(updated satisfies PrivateThoughtPayload);
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

      if (thought?.highlightedAt && isHighlightLocked(thought.highlightedAt)) {
        const remainingMs =
          THOUGHT_HIGHLIGHT_LOCK_DURATION_MS -
          (Date.now() - thought.highlightedAt.getTime());
        return highlightLockedResponse(remainingMs);
      }
    }

    const updated = await updateHighlight({
      highlighted: false,
      thoughtId,
      userId: session.user.id,
    });
    revalidateThoughtHighlight();

    return NextResponse.json(updated satisfies PrivateThoughtPayload);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}
