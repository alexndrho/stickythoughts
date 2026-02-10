import "server-only";

import { subDays } from "date-fns";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS } from "@/config/thought";

export type HighlightedThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;

export async function getHighlightedThought(): Promise<HighlightedThought | null> {
  const highlightCutoff = subDays(new Date(), THOUGHT_HIGHLIGHT_MAX_AGE_DAYS);

  return prisma.thought.findFirst({
    where: {
      deletedAt: null,
      highlightedAt: { not: null, gte: highlightCutoff },
    },
    orderBy: {
      highlightedAt: "desc",
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });
}
