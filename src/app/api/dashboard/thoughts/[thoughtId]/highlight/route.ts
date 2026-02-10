import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  HIGHLIGHT_LOCK_DURATION_MS,
  HIGHLIGHT_LOCK_HOURS,
} from "@/config/thought";
import { prisma } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import { isHighlightLocked } from "@/utils/thought";
import { formatDuration, intervalToDuration } from "date-fns";
import type { PrivateThoughtPayload } from "@/types/thought";
import type IError from "@/types/error";

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
  NextResponse.json(
    {
      issues: [
        {
          code: "thought/highlight-locked",
          message: `Highlighted thoughts can only be changed after ${HIGHLIGHT_LOCK_HOURS} hours. Try again in ${formatRemaining(
            remainingMs,
          )}.`,
        },
      ],
    } satisfies IError,
    { status: 403 },
  );

async function updateHighlight({
  highlighted,
  thoughtId,
  userId,
}: {
  highlighted: boolean;
  thoughtId: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (highlighted) {
      await tx.thought.updateMany({
        where: {
          highlightedAt: { not: null },
          deletedAt: null,
          id: { not: thoughtId },
        },
        data: {
          highlightedAt: null,
          highlightedById: null,
        },
      });
    }

    return tx.thought.update({
      where: { id: thoughtId },
      data: highlighted
        ? { highlightedAt: new Date(), highlightedById: userId }
        : { highlightedAt: null, highlightedById: null },
      select: {
        id: true,
        author: true,
        message: true,
        color: true,
        highlightedAt: true,
        createdAt: true,
        highlightedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  });
}

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
      const currentHighlight = await prisma.thought.findFirst({
        where: {
          highlightedAt: { not: null },
          deletedAt: null,
        },
        select: {
          id: true,
          highlightedAt: true,
        },
        orderBy: {
          highlightedAt: "desc",
        },
      });

      if (
        currentHighlight?.highlightedAt &&
        isHighlightLocked(currentHighlight.highlightedAt)
      ) {
        const remainingMs =
          HIGHLIGHT_LOCK_DURATION_MS -
          (Date.now() - currentHighlight.highlightedAt.getTime());
        return highlightLockedResponse(remainingMs);
      }
    }

    const updated = await updateHighlight({
      highlighted: true,
      thoughtId,
      userId: session.user.id,
    });

    revalidatePath("/", "page");
    return NextResponse.json(updated satisfies PrivateThoughtPayload);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
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
      const thought = await prisma.thought.findUnique({
        where: { id: thoughtId },
        select: { highlightedAt: true },
      });

      if (thought?.highlightedAt && isHighlightLocked(thought.highlightedAt)) {
        const remainingMs =
          HIGHLIGHT_LOCK_DURATION_MS -
          (Date.now() - thought.highlightedAt.getTime());
        return highlightLockedResponse(remainingMs);
      }
    }

    const updated = await updateHighlight({
      highlighted: false,
      thoughtId,
      userId: session.user.id,
    });

    revalidatePath("/", "page");
    return NextResponse.json(updated satisfies PrivateThoughtPayload);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
  }
}
